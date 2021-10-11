<template>
  <div class="absolute h-4 w-full">
    <canvas class="scale h-full w-full" id="timeline" />
  </div>
  <div
    class="timeline-hover absolute h-full w-px bg-yellow-500 top-0 z-10"
    :style="`left: ${hoverX}px`"
  />

  <div class="timeline-locator absolute h-full z-10" :style="`left: ${locatorX}px`">
    <div class="timeline-locator-head"></div>
    <div class="timeline-locator-body">
      <div class="h-full w-px bg-white top-0" />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';

  export default defineComponent({
    name: 'TimeLine',
    props: {
      prop: {
        type: Number,
        default: 0,
      },
    },

    setup() {
      const hoverX = ref(0);
      const locatorX = ref(0);
      const onTimeline = (e: MouseEvent) => {
        const tracks = document.getElementById('tracks') as HTMLElement;
        const left = tracks.getBoundingClientRect().left || 0;
        const x = e.pageX - left - scrollX;
        if (e.type === 'mousedown') {
          locatorX.value = x;
        } else if (e.type === 'mousemove') {
          hoverX.value = x;
        }
      };

      const events = ['mousemove', 'mousedown'];
      onMounted(() => {
        const tracks = document.getElementById('tracks') as HTMLElement;
        events.forEach((event) => {
          tracks.addEventListener(event, (e: any) => onTimeline(e));
        });
      });

      onMounted(() => {
        const tracks = document.getElementById('tracks') as HTMLElement;
        events.forEach((event) => {
          tracks.removeEventListener(event, onTimeline);
        });
      });
      return {
        locatorX,
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
