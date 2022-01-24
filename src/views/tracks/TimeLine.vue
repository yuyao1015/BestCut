<template>
  <!-- TODO: fixed canvas width -->
  <div ref="timelineRef" @pointerover="onTimelineOver" @pointerleave="onTimelineLeave">
    <div class="absolute h-2.5 w-full">
      <canvas id="timeline" class="scale h-full w-full" :style="`padding-left: ${lmin}px;`" />
    </div>
    <div
      v-show="hover"
      class="timeline-hover absolute h-full w-px bg-yellow-500 top-0 z-10 pointer-events-none"
      :style="`left: ${hoverX}px`"
    />

    <div
      ref="locator"
      class="timeline-locator absolute h-full w-px z-10"
      :style="`left: ${locatorX}px`"
    >
      <div :class="['timeline-locator-head', isDragging ? 'bg-white' : '']"></div>
      <div class="timeline-locator-body">
        <div class="h-full w-px bg-white top-0" />
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import type { ComponentPublicInstance } from 'vue';
import { ref, onMounted, onUnmounted, watch } from 'vue';

import { trackHeadWidth as lmin } from '@/settings/trackSetting';

import { on, off } from '@/utils/dom';
import { MouseCtl } from '@/logic/mouse';

import { useTrackStore } from '@/store/track';

const hover = ref(false);
const hoverX = ref(lmin);
const locatorX = ref(lmin);
const locator = ref<HTMLElement | null>(null);

const trackStore = useTrackStore();
watch(
  () => trackStore.manager.currentTime,
  (val: number) => {
    if (!trackStore.calcWidth) return;
    const x = trackStore.calcWidth(val / 1000).width;
    locatorX.value = lmin + x;
  }
);

const timelineRef = ref<ComponentPublicInstance | null>(null);
let mLocator: MouseCtl | null = null;

const onMouse = (e: PointerEvent) => {
  const timeline = timelineRef.value?.$el || timelineRef.value;
  if (!e || !timeline) return;
  const left = timeline.getBoundingClientRect().left || 0;
  let x = e.pageX - left - scrollX;
  x = Math.max(lmin, x);
  if (e.type === 'pointerdown') {
    locatorX.value = x;
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
  hover.value = true;
};
const onTimelineLeave = () => {
  // console.log('leave');
  events.forEach((event) => off(window, event, onMouse));
  hover.value = false;
};

const isDragging = ref(false);
const dragLocator = () => {
  if (!locator.value) return;

  mLocator = new MouseCtl(locator.value);
  mLocator.moveCallback = function () {
    const dx = this.x - this.lastX;
    const x = Math.max(lmin, locatorX.value + dx);
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
    border: solid 2px #fff;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
  }

  &-body {
    height: calc(100% - 15px);
  }
}
</style>
