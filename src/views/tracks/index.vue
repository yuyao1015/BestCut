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
          class="tracks-wrapper absolute h-full w-full"
        >
          <div
            ref="tracksRef"
            class="absolute w-full mt-2.5 overflow-y-scroll pb-10"
            :style="`height: calc(100% - 0.625rem);`"
          >
            <TrackContainer class="video-container overflow-y-auto" :list="tracks.video" />

            <TrackContainer
              ref="mainTrackRef"
              :class="['main-container flex items-center', isSticky ? 'sticky-track' : '']"
              :list="[tracks.main]"
            >
              <div class="text-lg w-full h-full rounded-xl flex items-center justify-center">
                <div
                  class="rounded-xl flex items-center justify-center w-14 h-14"
                  :style="'border: 5px solid #313135; background-color: #464649'"
                  @click="onMute"
                >
                  <SoundFilled v-if="isMute" />
                  <NotificationFilled v-else />
                </div>
              </div>
            </TrackContainer>

            <TrackContainer class="audio-container" :list="tracks.audio" />
          </div>
        </div>
      </div>
    </template>
  </SectionBox>
</template>

<script lang="tsx">
  import type { ComponentPublicInstance } from 'vue';
  import type { TrackItem } from '#/track';

  import { defineComponent, ref, onMounted, watch, reactive, nextTick } from 'vue';

  import { SoundFilled, NotificationFilled } from '@ant-design/icons-vue';

  import SectionBox from '@/layouts/SectionBox.vue';
  import TrackContainer from './TrackContainer.vue';
  import TimeLine from './TimeLine.vue';
  import TrackHead from './TrackHead.vue';

  import { trackHeadWidth } from '@/settings/componentSetting';

  import { useI18n } from '@/hooks/useI18n';
  import useTimeLine from '@/hooks/useTimeLine';
  import { getStyle, setStyle } from '@/utils/dom';

  import { mainTrack, audioList, list } from './data';
  import { forEachValue } from '@/utils';

  type TrackState = {
    video: TrackItem[][];
    main: TrackItem[];
    audio: TrackItem[][];
  };

  type TrackStateItem = TrackItem[] | TrackItem[][];

  export default defineComponent({
    name: 'Tracks',
    components: {
      SectionBox,
      TrackHead,
      TimeLine,
      TrackContainer,
      SoundFilled,
      NotificationFilled,
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

      const tracks = reactive<TrackState>({
        video: list,
        main: [mainTrack()],
        audio: audioList,
      });

      const wrapperWidth = ref(0);
      const footerRef = ref<ComponentPublicInstance | null>(null);
      const updateTrackWidth = () => {
        let trackWidth = 0;
        const updateWidth = (key: string, track: TrackStateItem | TrackItem) => {
          let left = 0;
          if (!Array.isArray(track)) {
            const { width, marginLeft } = calcTrackWidth(track);
            track.width = width;
            track.marginLeft = marginLeft;
            left = width + marginLeft;
            if (key === 'main') track.marginLeft = 0;
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

        forEachValue<TrackStateItem>(tracks, (key: string, val: TrackStateItem) => {
          updateWidth(key, val);
        });
        const footer = footerRef.value?.$el || footerRef.value;
        if (!footer) return;

        const rawW = parseInt(getStyle(footer, 'width'));
        const w = trackWidth + trackHeadWidth + 100;
        wrapperWidth.value = rawW > w ? rawW : w;
      };

      const percent = ref(50);
      const { useUnit, initTimeLine, calcTrackWidth } = useTimeLine(600, 30);
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

      return {
        title,
        wrapperWidth,

        isMute,
        isSticky,
        percent,
        tracks,

        footerRef,
        tracksWrapperRef,
        tracksRef,
        mainTrackRef,
        timelineRef,

        calcTrackWidth,
        onMute,
        move,
        down,
      };
    },
  });
</script>

<style lang="less" scoped>
  .sticky-track {
    background-color: rgba(255, 255, 255, 0.1);
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
