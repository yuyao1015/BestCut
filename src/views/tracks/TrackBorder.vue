<template>
  <div class="absolute w-full h-full top-0 left-0">
    <div
      ref="trackLeftRef"
      @pointerdown.stop="onTrackLeft(track, i, j)"
      @pointerup.stop="offTrackLeft"
      class="track-scale track-scale-left -left-0"
    >
      <MoreOutlined class="absolute -left-1 w-2" />
    </div>
    <div
      ref="trackRightRef"
      @pointerdown.stop="onTrackRight(track, i, j)"
      @pointerup.stop="offTrackRight"
      class="track-scale track-scale-right right-0"
    >
      <MoreOutlined class="absolute -right-1" />
    </div>
  </div>
</template>

<script lang="ts">
  import type { ComponentPublicInstance, PropType } from 'vue';

  import { isMedia, TrackItem } from '@/logic/track';
  import { defineComponent, ref } from 'vue';
  import { MoreOutlined } from '@ant-design/icons-vue';

  import { MouseCtl } from '@/logic/mouse';
  import { getShapedArrary } from '@/utils';

  const offset = 20;
  export default defineComponent({
    name: 'TrackBorder',
    components: {
      MoreOutlined,
    },
    props: {
      lists: {
        type: Array as PropType<TrackItem[][]>,
        default: () => [],
      },
      track: {
        type: Object as PropType<TrackItem>,
        default: {},
      },
      i: {
        type: Number,
        default: 0,
      },
      j: {
        type: Number,
        default: 0,
      },
      canDrag: {
        type: Boolean,
        default: true,
      },
    },
    emits: ['update:canDrag'],
    setup(props, { emit }) {
      const trackLeftRef = ref<ComponentPublicInstance | null>(null);
      const trackRightRef = ref<ComponentPublicInstance | null>(null);
      const mls: (MouseCtl | null)[][] = getShapedArrary(props.lists, null);
      const mrs: (MouseCtl | null)[][] = getShapedArrary(props.lists, null);

      const onTrackLeft = (track: TrackItem, i: number, j: number) => {
        emit('update:canDrag', false);

        const left = (trackLeftRef.value?.$el || trackLeftRef.value) as HTMLElement;
        let ml = mls[i][j];
        if (!ml) mls[i][j] = ml = new MouseCtl(left);
        const { marginLeft } = track;

        ml.moveCallback = function () {
          let dx = this.x - this.lastX;
          if (dx < 0 && isMedia(track.type)) {
            dx = dx < marginLeft - track.marginLeft ? marginLeft - track.marginLeft : dx;
          }
          dx = track.width - dx < offset ? 0 : dx;
          // track.start += dx; // TODO: map
          track.marginLeft += dx;
          track.width -= dx;
        };

        ml.upCallback = () => {
          emit('update:canDrag', true);
        };
      };

      const onTrackRight = (track: TrackItem, i: number, j: number) => {
        emit('update:canDrag', false);
        const right = (trackRightRef.value?.$el || trackRightRef.value) as HTMLElement;
        let mr = mrs[i][j];
        if (!mr) mrs[i][j] = mr = new MouseCtl(right);

        const { width } = track;
        mr.moveCallback = function () {
          let dx = this.x - this.lastX;
          if (dx > 0 && isMedia(track.type)) {
            dx = dx > width - track.width ? width - track.width : dx;
          }
          dx = track.width - dx < offset ? 0 : dx;

          // track.end += dx; //
          track.width += dx;
        };

        mr.upCallback = () => {
          emit('update:canDrag', true);
        };
      };

      const offTrackLeft = () => {
        emit('update:canDrag', true);
      };
      const offTrackRight = () => {
        emit('update:canDrag', true);
      };

      return {
        trackLeftRef,
        trackRightRef,
        onTrackLeft,
        onTrackRight,
        offTrackLeft,
        offTrackRight,
      };
    },
  });
</script>

<style lang="less" scoped>
  .track-scale {
    position: absolute;
    display: flex;
    align-items: center;
    background-color: #fff;
    height: 100%;
    width: 0.1rem;
    background-size: 100% 100%;
    color: #000;
    font-size: 10px;

    &-left {
      cursor: ew-resize;
    }

    &-right {
      cursor: ew-resize;
    }
  }
</style>
