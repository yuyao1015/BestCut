<template>
  <SectionBox ref="footerRef" :title="title">
    <template #header>
      <TrackHead v-model:percent="percent" />
    </template>

    <template #content>
      <TimeLine
        id="timeline"
        relative
        h-full
        :draw="drawTimeline"
        :style="`width: ${wrapperWidth}px`"
      >
        <div
          id="tracks-wrapper"
          ref="tracksWrapperRef"
          class="tracks-wrapper absolute h-full w-full select-none"
        >
          <div
            class="tracks absolute w-full mt-2.5 overflow-y-scroll"
            h="[calc(100%-0.625rem)]"
            @dragenter="onResourceEnter"
            @dragleave="onResourceLeave"
            @drop="onResourceDrop"
          >
            <TrackContainer
              :class="['video-container overflow-y-auto', !isMapEmpty ? 'min-h-1/3' : '']"
              :lists="trackMap.video"
              :type="ContainerType.Video"
            />

            <TrackContainer
              ref="mainTrackRef"
              :class="[
                'main-container flex items-center',
                isSticky && trackMap.video.length ? 'sticky-track' : '',
                isMapEmpty ? 'absolute h-full w-full my-auto' : '',
              ]"
              :lists="[trackMap.main]"
              :isMute="isMute"
              :type="ContainerType.Main"
            >
              <div
                v-if="!isMapEmpty || isResourceOver"
                class="text-lg w-full h-full rounded-xl flex items-center justify-center"
              >
                <div
                  class="rounded-xl flex items-center justify-center w-14 h-14"
                  border="5px solid #313135"
                  bg="#464649"
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
              :type="ContainerType.Audio"
            />
          </div>
        </div>
      </TimeLine>
    </template>
  </SectionBox>
</template>

<script lang="ts" setup>
import type { ComponentPublicInstance } from 'vue';
import { TrackMap, TrackItem } from '@/logic/tracks';

import { SoundFilled, AudioMutedOutlined } from '@ant-design/icons-vue';

import SectionBox from '@/layouts/SectionBox.vue';
import TrackContainer from './TrackContainer.vue';
import TimeLine from './TimeLine.vue';
import TrackHead from './TrackHead.vue';

import { TrackHeadWidth, TimelineTailWidth } from '@/settings/tracksSetting';

import { useTimeLine } from '@/hooks/useTimeLine';
import { getStyle, setStyle } from '@/utils/dom';

import { forEachValue } from '@/utils';
import { useTrackStore } from '@/store/track';
import { ContainerType } from '@/enums/track';

import _ from 'lodash-es';

type TrackStateItem = TrackItem[] | TrackItem[][];

const { t } = useI18n();
const title = t('components.tracks');

const trackStore = useTrackStore();
const trackMap = computed(() => trackStore.trackMap);
const isMapEmpty = computed(() => trackStore.isMapEmpty());
const isResourceOver = computed(() => trackStore.isResourceOver);

watch(
  trackMap,
  (_, oldMap: TrackMap) => {
    if (trackStore.isMapEmpty(oldMap)) {
      // const { _useUnit, _calcTrackWidth } = useTimeLine(600, 30);
      // useUnit = _useUnit
      // calcWidth = _calcTrackWidth
      // updateTrackWidth();
    }
  },
  {
    deep: true,
  }
);

const wrapperWidth = ref(0);
const { useUnit, initTimeLine, drawTimeline } = useTimeLine(600, 30);
const footerRef = ref<ComponentPublicInstance | null>(null);
const updateTrackWidth = () => {
  let trackWidth = 0;
  const updateWidth = (key: string, track: TrackStateItem | TrackItem) => {
    let left = 0;
    if (!Array.isArray(track)) {
      const width = trackStore.calcWidth(track);
      track.width = width;
      track.marginLeft = trackStore.tp2x(track.offset);
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
  const w = trackWidth + TrackHeadWidth + TimelineTailWidth;
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

const isSticky = ref(false);
const mainTrackRef = ref<ComponentPublicInstance | null>(null);
const tracksWrapperRef = ref<ComponentPublicInstance | null>(null);
const stickyTrack = () => {
  const main = mainTrackRef.value?.$el || mainTrackRef.value;
  const wrapper = tracksWrapperRef.value?.$el || tracksWrapperRef.value;
  const track = wrapper?.children[0] as HTMLElement;
  if (!track || !wrapper || !main) return;

  const h = parseInt(getStyle(main, 'height'));
  const height = parseInt(getStyle(wrapper, 'height'));

  const margin = parseInt(getStyle(track, 'marginTop'));
  const pad = parseInt(getStyle(track, 'paddingTop'));
  const max = height - h - margin - pad;
  const min = parseInt(getStyle(track, 'minHeight'));

  const videoContainer = track?.children[0] as HTMLElement;
  if (!videoContainer) return;
  setStyle(videoContainer, 'max-height', max + 'px');
  if (track.scrollTop === 0 && max > min && main.offsetTop - pad === max) {
    isSticky.value = true;
  } else isSticky.value = false;
};
const onStickyTrack = (e: WheelEvent) => {
  _.debounce(stickyTrack, 100)();
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
  trackStore.setArea(ContainerType.OutSide);
};
const onResourceDrop = () => {
  enterCnt = 0;
};

setTimeout(() => {
  percent.value = 89;
}, 0);
</script>

<style lang="less" scoped>
.sticky-track {
  background-color: rgba(255, 255, 255, 0.08);
  padding-bottom: 15px;
  // transition: 100ms all;
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
