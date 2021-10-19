<template>
  <!-- TODO: fixed canvas width -->
  <div class="absolute h-2.5 w-full">
    <canvas id="timeline" class="scale h-full w-full" :style="`padding-left: ${lmin}px;`" />
  </div>
  <div
    v-if="hover"
    class="timeline-hover absolute h-full w-px bg-yellow-500 top-0 z-10"
    :style="`left: ${hoverX}px`"
  ></div>

  <div ref="locator" class="timeline-locator absolute h-full z-10" :style="`left: ${locatorX}px`">
    <div :class="['timeline-locator-head', isDragging ? 'bg-white' : '']"></div>
    <div class="timeline-locator-body">
      <div class="h-full w-px bg-white top-0"></div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';

  import { trackHeadWidth as lmin } from '@/settings/componentSetting';

  import { usePlayerStore } from '@/store/player';
  import { on, off } from '@/utils/dom';
  import { durationString2Sec } from '@/utils/player';
  import { MouseCtl } from '@/logic/mouse';
  import { throttleAndDebounce } from '@/utils';

  export default defineComponent({
    name: 'TimeLine',
    props: {
      prop: {
        type: Number,
        default: 0,
      },
    },

    setup() {
      const hover = ref(false);
      const hoverX = ref(lmin);
      const locatorX = ref(lmin);
      const locator = ref<HTMLElement | null>(null);

      let tracks: HTMLElement | null = null;
      let mLocator: MouseCtl | null = null;

      const playerStore = usePlayerStore();
      const duration = computed(() => {
        return playerStore.total ? playerStore.total : durationString2Sec('30:00');
      });
      duration.value;

      // TODO: conflict between pointermove & scroll
      const onMouse = (e: PointerEvent) => {
        if (!e) return;
        const left = tracks?.getBoundingClientRect().left || 0;
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
      const throttleMouse = throttleAndDebounce(onMouse, 50);

      // const events = ['pointermove', 'pointerdown'];
      const events: any = [];
      const onTimeline = () => {
        events.forEach((event) => on(window, event, throttleMouse));
        hover.value = true;
      };
      const offTimeline = () => {
        events.forEach((event) => off(window, event, throttleMouse));
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
        tracks = document.getElementById('tracks-wrapper') as HTMLElement;
        if (!tracks) return;
        on(tracks, 'pointerover', onTimeline);
        on(tracks, 'pointerleave', offTimeline);

        dragLocator();
      });

      onUnmounted(() => {
        if (!tracks) return;
        off(tracks, 'pointerover', onTimeline);
        off(tracks, 'pointerleave', offTimeline);
        mLocator && mLocator.stopAllListeners('self');
      });
      return {
        lmin,
        locator,
        locatorX,
        hover,
        hoverX,
        isDragging,
      };
    },
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
