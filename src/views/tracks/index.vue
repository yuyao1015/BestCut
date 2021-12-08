<template>
  <SectionBox ref="footerRef" :title="title">
    <template #header>
      <TrackHead v-model:percent="percent" />
    </template>

    <template #content>
      <div
        class="h-full relative"
        :style="`width: ${wrapperWidth}px`"
        @pointerover="move"
        @pointerdown="down"
      >
        <TimeLine ref="timelineRef" class="timeline absolute w-full h-full"></TimeLine>

        <div
          ref="tracksWrapperRef"
          id="tracks-wrapper"
          class="tracks-wrapper absolute h-full w-full select-none"
        >
          <div
            ref="tracksRef"
            class="tracks absolute w-full mt-2.5 overflow-y-scroll"
            :style="`height: calc(100% - 0.625rem);`"
            @dragenter="onResourceEnter"
            @dragleave="onResourceLeave"
            @drop="onResourceDrop"
          >
            <TrackContainer
              :class="['video-container overflow-y-auto', !isMapEmpty ? 'min-h-1/3' : '']"
              :lists="trackMap.video"
            />

            <TrackContainer
              ref="mainTrackRef"
              :class="[
                'main-container flex items-center',
                isSticky && trackMap.video.length ? 'sticky-track' : '',
                isMapEmpty ? 'absolute h-full w-full my-auto' : '',
              ]"
              :isMapEmpty="isMapEmpty"
              :lists="[trackMap.main]"
              :isMute="isMute"
            >
              <div
                v-if="trackMap.main.length"
                class="text-lg w-full h-full rounded-xl flex items-center justify-center"
              >
                <div
                  class="rounded-xl flex items-center justify-center w-14 h-14"
                  :style="'border: 5px solid #313135; background-color: #464649'"
                  @click="onMute"
                >
                  <AudioMutedOutlined v-if="isMute" />
                  <SoundFilled v-else />
                </div>
              </div>
            </TrackContainer>

            <TrackContainer
              :class="['audio-container', !isMapEmpty ? 'min-h-1/3' : '']"
              :lists="trackMap.audio"
            />
          </div>
        </div>
      </div>
    </template>
  </SectionBox>
</template>

<script lang="tsx">
  import { ComponentPublicInstance, onUnmounted } from 'vue';
  import { TrackMap, TrackItem } from '@/logic/track';

  import { defineComponent, ref, onMounted, watch, nextTick, computed } from 'vue';

  import { SoundFilled, AudioMutedOutlined } from '@ant-design/icons-vue';

  import SectionBox from '@/layouts/SectionBox.vue';
  import TrackContainer from './TrackContainer.vue';
  import TimeLine from './TimeLine.vue';
  import TrackHead from './TrackHead.vue';

  import { trackHeadWidth } from '@/settings/componentSetting';

  import { useI18n } from '@/hooks/useI18n';
  import useTimeLine from '@/hooks/useTimeLine';
  import { getStyle, setStyle } from '@/utils/dom';

  import { forEachValue } from '@/utils';
  import { useTrackStore } from '@/store/track';

  type TrackStateItem = TrackItem[] | TrackItem[][];

  export default defineComponent({
    name: 'Tracks',
    components: {
      SectionBox,
      TrackHead,
      TimeLine,
      TrackContainer,
      SoundFilled,
      AudioMutedOutlined,
    },
    props: {
      prop: {
        type: Boolean,
        default: false,
      },
    },
    emits: [],
    setup() {
      const { t } = useI18n();
      const title = t('components.tracks');

      const trackStore = useTrackStore();
      const trackMap = ref(trackStore.trackMap);
      const isMapEmpty = computed(() => {
        let empty = true;
        forEachValue(trackMap.value, (_, v) => {
          if (v.length) empty = false;
        });
        return empty;
      });

      watch(
        () => trackStore.trackMap,
        (newVal: TrackMap, oldVal: TrackMap) => {
          newVal;
          // trackMap.value = newVal;
          if (!oldVal.main.length && !oldVal.audio.length && !oldVal.video.length) {
            // const { _useUnit, _calcTrackWidth } = useTimeLine(600, 30);
            // useUnit = _useUnit
            // calcTrackWidth = _calcTrackWidth
          }
          // updateTrackWidth();
        },
        {
          deep: true,
        }
      );

      const wrapperWidth = ref(0);
      const { useUnit, initTimeLine, calcTrackWidth } = useTimeLine(600, 30);
      trackStore.setCalculator(calcTrackWidth);
      const footerRef = ref<ComponentPublicInstance | null>(null);
      const updateTrackWidth = () => {
        let trackWidth = 0;
        const updateWidth = (key: string, track: TrackStateItem | TrackItem) => {
          let left = 0;
          if (!Array.isArray(track)) {
            const { width, marginLeft } = calcTrackWidth(track);
            track.width = width;
            track.marginLeft = marginLeft;
            if (key === 'main') track.marginLeft = 0;
            left = width + track.marginLeft;
          } else {
            track.forEach((item, idx) => {
              left += updateWidth(key, item);
              if (idx === track.length - 1) {
                trackWidth = Math.max(trackWidth, left);
                left = 0;
              }
            });
          }
          return left;
        };

        forEachValue<TrackStateItem>(trackMap.value, (key: string, val: TrackStateItem) => {
          updateWidth(key, val);
        });
        const footer = footerRef.value?.$el || footerRef.value;
        if (!footer) return;

        const rawW = parseInt(getStyle(footer, 'width'));
        const w = trackWidth + trackHeadWidth + 100;
        wrapperWidth.value = rawW > w ? rawW : w;
      };

      const percent = ref(0);
      useUnit(percent);
      watch(percent, () => {
        updateTrackWidth();
      });

      const isMute = ref(false);
      const onMute = (e: MouseEvent) => {
        e.stopPropagation();
        isMute.value = !isMute.value;
      };

      // let showTimeline = true;
      const timelineRef = ref<typeof TimeLine | null>(null);
      const move = () => {
        // timelineRef.value && timelineRef.value.onTimeline();
      };
      const down = () => {
        // console.log('1');
      };

      const isSticky = ref(false);
      const mainTrackRef = ref<ComponentPublicInstance | null>(null);
      const tracksWrapperRef = ref<ComponentPublicInstance | null>(null);
      const tracksRef = ref<ComponentPublicInstance | null>(null);
      const stickyTrack = () => {
        const main = mainTrackRef.value?.$el || mainTrackRef.value;
        const track = tracksRef.value?.$el || tracksRef.value;
        const wrapper = tracksWrapperRef.value?.$el || tracksWrapperRef.value;
        if (!track || !wrapper || !main) return;

        const h = parseInt(getStyle(main, 'height'));
        const height = parseInt(getStyle(wrapper, 'height'));

        const margin = parseInt(getStyle(track, 'marginTop'));
        const pad = parseInt(getStyle(track, 'paddingTop'));
        const max = height - h - margin - pad;

        const videoContainer = track.children[0] as HTMLElement;
        setStyle(videoContainer, 'max-height', max + 'px');
        if (track.scrollTop === 0 && main.offsetTop - pad === max) {
          isSticky.value = true;
        } else isSticky.value = false;
      };
      const onStickyTrack = (e: WheelEvent) => {
        stickyTrack();
        e.stopPropagation();
      };

      onMounted(() => {
        window.addEventListener('mousewheel', onStickyTrack, { passive: false });
        stickyTrack();

        updateTrackWidth();
        nextTick(() => initTimeLine());
      });

      onUnmounted(() => {
        window.removeEventListener('mousewheel', onStickyTrack);
      });

      let enterCnt = 0;
      const onResourceEnter = () => {
        enterCnt++;
      };
      const onResourceLeave = () => {
        enterCnt--;
        if (enterCnt !== 0) return;
        trackStore.setResourceOverState(false);
      };
      const onResourceDrop = () => {
        enterCnt = 0;
      };

      return {
        title,
        wrapperWidth,

        isMute,
        isMapEmpty,
        isSticky,
        percent,
        trackMap,

        footerRef,
        tracksWrapperRef,
        tracksRef,
        mainTrackRef,
        timelineRef,

        onMute,
        move,
        down,
        onResourceEnter,
        onResourceLeave,
        onResourceDrop,
      };
    },
  });
</script>

<style lang="less" scoped>
  .sticky-track {
    background-color: rgba(255, 255, 255, 0.08);
    padding-bottom: 15px;
    transition: 100ms all;
  }

  .sticky-track::after {
    position: absolute;
    content: '';
    bottom: 7px;
    left: 128px;
    width: 50%;
    height: 2px;
    background-color: #3a7faf;
  }
</style>
