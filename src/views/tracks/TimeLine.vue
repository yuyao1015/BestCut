<template>
  <div class="absolute h-4 w-full">
    <canvas id="timeline" class="scale h-full w-full" />
  </div>
  <div
    v-if="hover"
    class="timeline-hover absolute h-full w-px bg-yellow-500 top-0 z-10"
    :style="`left: ${hoverX}px`"
  />

  <div ref="locator" class="timeline-locator absolute h-full z-10" :style="`left: ${locatorX}px`">
    <div class="timeline-locator-head"></div>
    <div class="timeline-locator-body">
      <div class="h-full w-px bg-white top-0" />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
  import { trackHeadWidth as lmin } from '@/settings/componentSetting';

  export default defineComponent({
    name: 'TimeLine',
    props: {
      prop: {
        type: Number,
        default: 0,
      },
    },

    setup() {
      const hover = ref(true);
      const hoverX = ref(0);
      const locatorX = ref(lmin);
      const locator = ref<HTMLElement | null>(null);

      let ctx: CanvasRenderingContext2D | null = null;

      const onTimeline = (e: MouseEvent) => {
        const tracks = document.getElementById('tracks') as HTMLElement;
        const left = tracks.getBoundingClientRect().left || 0;
        const x = e.pageX - left - scrollX;
        if (e.type === 'mousedown') {
          locatorX.value = Math.max(lmin, x);
        } else if (e.type === 'mousemove') {
          hoverX.value = Math.max(lmin, x);
        }
      };

      const initCanvas = () => {
        const canvas = document.getElementById('timeline') as HTMLCanvasElement;
        ctx = canvas.getContext('2d');
      };
      const drawTimeline = () => {
        //
      };

      const events = ['mousemove', 'mousedown'];
      onMounted(() => {
        const tracks = document.getElementById('tracks') as HTMLElement;
        events.forEach((event) => {
          tracks.addEventListener(event, (e: any) => onTimeline(e));
        });

        // TODO: drag
        // locator.value && locator.value.addEventListener('mousedown', () => {});

        initCanvas();
        drawTimeline();
      });

      onUnmounted(() => {
        const tracks = document.getElementById('tracks') as HTMLElement;
        events.forEach((event) => {
          tracks.removeEventListener(event, onTimeline);
        });
      });
      return {
        locator,
        locatorX,
        hover,
        hoverX,
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
