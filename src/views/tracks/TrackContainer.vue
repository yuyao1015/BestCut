<template>
  <div class="flex w-full">
    <div class="track-container-head h-full" :style="`flex:0 0 ${trackHeadWidth}px;`">
      <slot></slot>
    </div>
    <div class="list w-full h-full flex flex-col justify-center">
      <div
        v-for="(tracks, i) in list"
        :key="i"
        :class="['track-list flex w-full my-2', isListActive(tracks) ? 'track-list-active' : '']"
      >
        <div
          v-for="(track, j) in tracks"
          :key="j"
          :class="[
            'track-item rounded-sm overflow-hidden text-xs mr-px relative px-1',
            `track-item-${track.type}`,
            track.active ? 'border-white border' : '',
          ]"
          :style="`flex:0 0 ${track.width}px; margin-left: ${track.marginLeft}px`"
          @click="onTrackActive(track)"
          v-click-outside="() => onClickOutside(track)"
          draggable
        >
          <div class="h-full w-full">
            <div v-if="!['video', 'audio'].includes(track.type)" class="track-item-head w-full">
              <component v-if="track.icon" :is="track.icon" class="track-item-title"></component>

              <img v-if="track.sticker" :src="track.sticker" alt="" class="track-item-title" />

              <div v-if="track.type !== 'sticker'" class="track-item-title">
                {{ track.trackName }}
              </div>
            </div>

            <div v-else class="track-item-head">
              <span v-for="(title, k) in getTrackHead(track)" :key="k" class="track-item-title">
                {{ title }}
              </span>
            </div>

            <div v-if="track.type === 'video'" class="h-10">cover</div>
            <div v-if="track.type === 'video'" class="h-5">foot wave</div>

            <div v-if="track.type === 'audio'" class="h-8">{{ track.wave }}</div>
          </div>

          <!-- scale duration at border  -->
          <div v-if="track.active" class="absolute w-full h-full top-0 left-0">
            <div
              ref="trackLeftRef"
              class="track-scale track-scale-left -left-0"
              @click="onTrackLeft(track)"
            >
              <MoreOutlined class="absolute -left-1" />
            </div>
            <div ref="trackRightRef" class="track-scale track-scale-right right-0">
              <MoreOutlined class="absolute -right-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import type { TrackItem } from '#/track';
  import type { ComponentPublicInstance } from 'vue';

  import { computed, defineComponent, PropType, ref, onMounted } from 'vue';
  import { MoreOutlined } from '@ant-design/icons-vue';

  import { ClickOutside } from '@/directives';
  import { MouseCtl } from '@/logic/mouse';

  import { trackHeadWidth } from '@/settings/componentSetting';

  export default defineComponent({
    name: '',
    components: {
      MoreOutlined,
    },
    directives: {
      ClickOutside,
    },
    props: {
      list: {
        type: Array as PropType<TrackItem[][]>,
        default: () => [],
      },
    },
    emits: [],
    setup(_, { slots }) {
      const isMain = computed(() => {
        return Boolean(slots.default);
      });

      const getTrackHead = (track: TrackItem) => {
        const head = [track.trackName, track.duration];
        if (isMain && track.type === 'video') head.unshift('已静音');
        return head;
      };

      const isListActive = (tracks: TrackItem[]) => {
        let active = false;
        tracks.forEach((track) => {
          if (track.active) active = true;
        });
        return active;
      };
      const onTrackActive = (track: TrackItem) => {
        track.active = true;
      };
      const onClickOutside = (track: TrackItem) => {
        track.active = false;
      };

      const trackLeftRef = ref<ComponentPublicInstance | null>(null);
      const trackRightRef = ref<ComponentPublicInstance | null>(null);

      const onTrackLeft = (track: TrackItem) => {
        const left = (trackLeftRef.value?.$el || trackLeftRef.value) as HTMLElement;
        const ml = new MouseCtl(left);
        ml.moveCallback = function () {
          // const dx = this.x - this.lastX;
          if (track.marginLeft) track.marginLeft;
        };
      };

      const onTrackRight = (track: TrackItem) => {
        const right = (trackRightRef.value?.$el || trackLeftRef.value) as HTMLElement;
        const mr = new MouseCtl(right);

        mr.moveCallback = function () {
          // const dx = this.x - this.lastX;
          track;
        };
      };

      onMounted(() => {});

      return {
        trackHeadWidth,
        trackLeftRef,
        trackRightRef,
        isListActive,
        getTrackHead,
        onTrackActive,
        onClickOutside,
        onTrackLeft,
        onTrackRight,
      };
    },
  });
</script>

<style lang="less" scoped>
  .track-item {
    &-video {
      background-color: #1e4c51;
    }

    &-audio {
      background-color: #182f55;
    }

    &-wave {
      background-color: #3a7faf;
    }

    &-foot-wave {
      background-color: #2d6666;
    }

    &-text {
      background-color: #924e3c;
    }

    &-sprite {
      background-color: #6e4c7f;
    }

    &-sticker {
      background-color: #cc9641;
    }

    &-title {
      display: flex;
      align-items: center;
      height: 1rem;
      padding: 0 1px;
      margin: 0 0.25rem;
      border-radius: 0.125rem;
      background-color: rgba(255, 255, 255, 0.1);
    }

    &-head {
      display: flex;
      align-items: center;
      width: 100%;
      height: 1.25rem;
    }
  }

  .track-item:last-child {
    margin-right: 0;
  }

  .track-list-active {
    background-color: #383839;
    border-top: solid 1px #4d4d4e;
    border-bottom: solid 1px #4d4d4e;
  }

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
