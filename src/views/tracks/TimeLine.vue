<template>
  <div
    ref="timelineRef"
    @pointerover="onTimelineOver"
    @pointerleave="onTimelineLeave"
    @mousewheel="onTimelineScroll"
  >
    <div class="absolute h-2.5 w-screen" :style="`margin-left: ${marginLeft}px;`">
      <canvas id="scaler" class="h-full w-full m-0" />
    </div>
    <div
      v-show="hover"
      class="timeline-hover absolute h-full w-px bg-yellow-500 top-0 z-10 pointer-events-none"
      :style="`left: ${hoverX}px`"
    />

    <div
      ref="locator"
      :class="[
        'timeline-locator absolute h-full w-px z-10',
        isMapEmpty ? 'pointer-events-none' : '',
      ]"
      :style="`left: ${locatorX}px;${''}`"
    >
      <div
        :class="[
          'timeline-locator-head border-2',
          isDragging ? 'bg-white' : '',
          isMapEmpty ? 'border-gray-400' : 'border-white',
        ]"
      ></div>
      <div class="timeline-locator-body">
        <div :class="['h-full w-px top-0', isMapEmpty ? 'bg-gray-500' : 'bg-white']" />
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import type { ComponentPublicInstance } from 'vue';

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

import { on, off } from '@/utils/dom';
import { MouseCtl } from '@/logic/mouse';
import { useTrackStore } from '@/store/track';
import { TrackHeadWidth, TimelineTailWidth } from '@/settings/tracksSetting';

type Props = {
  draw: (x?: number) => void;
};

const props = withDefaults(defineProps<Props>(), {
  draw: () => undefined,
});

const hover = ref(false);
const hoverX = ref(TrackHeadWidth);
const locatorX = ref(TrackHeadWidth);
const locator = ref<HTMLElement | null>(null);

const trackStore = useTrackStore();
const isMapEmpty = computed(() => trackStore.isMapEmpty());
watch(
  () => trackStore.manager.currentTime,
  (val: number) => {
    if (!trackStore.calcWidth) return;
    const x = trackStore.calcWidth(val / 1000).width;
    locatorX.value = TrackHeadWidth + x;
  }
);

const timelineRef = ref<ComponentPublicInstance | null>(null);
let mLocator: MouseCtl | null = null;

const onMouse = (e: PointerEvent) => {
  const timeline = timelineRef.value?.$el || timelineRef.value;
  if (!timeline) return;
  const left = timeline.getBoundingClientRect().left || 0;
  let x = e.pageX - left - scrollX;
  x = Math.max(TrackHeadWidth, x);
  if (e.type === 'pointerdown') {
    if (!isMapEmpty.value) locatorX.value = x;
    hoverX.value = x;
  } else if (e.type === 'pointermove') {
    hoverX.value = x;
  }
  if (hoverX.value === locatorX.value) hover.value = false;
};

const events: string[] = ['pointermove', 'pointerdown'];
const onTimelineOver = () => {
  // console.log('over');
  events.forEach((event) => on(window, event, onMouse));
  if (trackStore.hoverVisiable) hover.value = true;
};
const onTimelineLeave = () => {
  // console.log('leave');
  events.forEach((event) => off(window, event, onMouse));
  hover.value = false;
};

const marginLeft = ref(TrackHeadWidth);
const onTimelineScroll = (e: WheelEvent) => {
  const main = (e.currentTarget as HTMLElement).parentNode as HTMLElement;
  const { scrollLeft } = main;
  const diff = scrollLeft - TrackHeadWidth;
  const threshold = TimelineTailWidth / 2;
  marginLeft.value = diff < threshold ? TrackHeadWidth : scrollLeft - threshold;
  props.draw(diff < threshold ? scrollLeft - diff : scrollLeft - threshold);

  const timeline = timelineRef.value?.$el || timelineRef.value;
  main.scrollLeft = Math.min(scrollLeft, parseFloat(timeline.style.width) - main.offsetWidth);
};

const isDragging = ref(false);
const dragLocator = () => {
  if (!locator.value) return;

  mLocator = new MouseCtl(locator.value);
  mLocator.moveCallback = function () {
    const dx = this.x - this.lastX;
    const x = Math.max(TrackHeadWidth, locatorX.value + dx);
    locatorX.value = x;
    isDragging.value = true;
    hover.value = false;
  };
  mLocator.upCallback = function () {
    isDragging.value = false;
    if (hoverX.value === locatorX.value) hover.value = false;
  };
};

onMounted(() => {
  dragLocator();
});

onUnmounted(() => {
  mLocator && mLocator.stopAllListeners();
});
</script>

<style lang="less" scoped>
.timeline-locator {
  &-head {
    width: 10px;
    height: 15px;
    transform: translateX(-50%);
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
  }

  &-body {
    height: calc(100% - 15px);
  }
}
</style>
