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

        <div id="tracks-wrapper" class="tracks-wrapper absolute h-full w-full select-none">
          <div
            class="absolute w-full mt-2.5 overflow-y-scroll"
            :style="`height: calc(100% - 0.625rem);`"
          >
            <TrackContainer
              ref="containerRef"
              class="video-container relative overflow-y-auto max-h-full pb-10"
              :lists="[...trackLists.video, trackLists.main, ...trackLists.audio]"
              :mainIdx="mainIdx"
            />
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

  import { SoundFilled, AudioMutedOutlined } from '@ant-design/icons-vue';

  import SectionBox from '@/layouts/SectionBox.vue';
  import TrackContainer from './TrackContainer.vue';
  import TimeLine from './TimeLine.vue';
  import TrackHead from './TrackHead.vue';

  import { containerHeadWidth } from '@/settings/componentSetting';

  import { useI18n } from '@/hooks/useI18n';
  import useTimeLine from '@/hooks/useTimeLine';
  import { getStyle } from '@/utils/dom';

  import { mainList, audioList, videoList } from './data';
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

      const trackLists = reactive<TrackState>({
        video: videoList,
        // video: [],
        main: mainList,
        // main: [],
        audio: audioList,
        // audio: [],
      });
      const mainIdx = ref(trackLists.video.length);

      const wrapperWidth = ref(0);
      const { useUnit, initTimeLine, calcTrackWidth } = useTimeLine(600, 30);
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

        forEachValue<TrackStateItem>(trackLists, (key: string, val: TrackStateItem) => {
          updateWidth(key, val);
        });
        const footer = footerRef.value?.$el || footerRef.value;
        if (!footer) return;

        const rawW = parseInt(getStyle(footer, 'width'));
        const w = trackWidth + containerHeadWidth + 100;
        wrapperWidth.value = rawW > w ? rawW : w;
      };

      const percent = ref(0);
      useUnit(percent);
      watch(percent, () => {
        updateTrackWidth();
      });

      // let showTimeline = true;
      const timelineRef = ref<typeof TimeLine | null>(null);
      const move = () => {
        // timelineRef.value && timelineRef.value.onTimeline();
      };
      const down = () => {
        // console.log('1');
      };

      // TODO: scroll bar
      const isSticky = ref(false);
      const containerRef = ref<ComponentPublicInstance | null>(null);
      const stickyTrack = () => {
        // const container = containerRef.value?.$el || containerRef.value;
        // const tracks = container.children[1];
        // const h = parseInt(getStyle(container, 'height'));
        // const height = parseInt(getStyle(tracks, 'height'));
        // console.log(container);
        // console.log(h, height, container.scrollTop);
      };
      const onStickyTrack = (e: WheelEvent) => {
        stickyTrack();
        e.stopPropagation();
      };

      onMounted(() => {
        stickyTrack();
        window.addEventListener('mousewheel', onStickyTrack, { passive: false });

        updateTrackWidth();
        nextTick(() => initTimeLine());
      });

      return {
        title,
        wrapperWidth,

        isSticky,
        percent,
        trackLists,
        mainIdx,

        footerRef,
        containerRef,
        timelineRef,

        calcTrackWidth,
        move,
        down,
      };
    },
  });
</script>

<style lang="less" scoped>
  //
</style>
