<script lang="tsx">
  import type { AudioTrackItem, TrackItem, VideoTrackItem } from '#/track';
  import type { ComponentPublicInstance } from 'vue';

  import { computed, h, defineComponent, PropType, ref, reactive, watch } from 'vue';
  import { MoreOutlined } from '@ant-design/icons-vue';

  import { ClickOutside } from '@/directives';
  import { MouseCtl } from '@/logic/mouse';

  import { trackHeadWidth } from '@/settings/componentSetting';

  export default defineComponent({
    name: 'TrackContainer',
    directives: {
      ClickOutside,
    },
    props: {
      lists: {
        type: Array as PropType<TrackItem[][]>,
        default: () => [],
      },
      calcWidth: {
        type: Function,
        default: () => {},
      },
    },
    emits: [],
    setup(props, { slots }) {
      const lists = computed(() => props.lists);
      const isMain = computed(() => {
        return Boolean(slots.default);
      });

      const getTrackHead = (track: TrackItem) => {
        const head = [track.trackName, track.duration];
        if (isMain.value && track.type === 'video') head.unshift('已静音');
        return head;
      };

      const video = (track: VideoTrackItem) => (
        <div class="h-full w-full">
          <div class="track-item-head">
            {getTrackHead(track).map((title) => (
              <span class="track-item-title">{title}</span>
            ))}
          </div>
          <div class="h-10">cover</div>
          <div class="h-5">foot wave</div>
        </div>
      );

      const audio = (track: AudioTrackItem) => (
        <div class="h-full w-full">
          <div class="track-item-head">
            {getTrackHead(track).map((title) => (
              <span class="track-item-title">{title}</span>
            ))}
          </div>
          <div class="h-8">{track.wave}</div>
        </div>
      );

      const attachment = (track: TrackItem) => (
        <div class={'track-item-head w-full'}>
          {track.icon && (() => h(track.icon, { class: 'track-item-title' }))()}
          {track.sticker && (() => <img class="track-item-title" src={track.sticker} />)()}
          {track.type !== 'sticker' &&
            (() => h('div', { class: 'track-item-title' }, track.trackName))()}
        </div>
      );

      const trackMap = {
        video,
        audio,
        sticker: attachment,
        text: attachment,
        sprite: attachment,
        filter: attachment,
      };

      /*
        border
      */
      const canDrag = ref(true);
      const trackLeftRef = ref<ComponentPublicInstance | null>(null);
      const trackRightRef = ref<ComponentPublicInstance | null>(null);
      let ml: MouseCtl | null = null;
      let mr: MouseCtl | null = null;
      const onTrackLeft = (e: MouseEvent, track: TrackItem) => {
        e.stopPropagation();
        canDrag.value = false;
        const left = (trackLeftRef.value?.$el || trackLeftRef.value) as HTMLElement;
        ml = new MouseCtl(left);
        const { marginLeft } = track;

        ml.moveCallback = function () {
          let dx = this.x - this.lastX;
          if (dx < 0 && ['video', 'audio'].includes(track.type)) {
            dx = dx < marginLeft - track.marginLeft ? marginLeft - track.marginLeft : dx;
          }
          dx = track.width - dx < 20 ? 0 : dx;
          track.start += dx; // TODO: map
          track.marginLeft += dx;
          track.width -= dx;
        };

        ml.upCallback = function () {
          canDrag.value = true;
        };
      };

      const onTrackRight = (e: MouseEvent, track: TrackItem) => {
        e.stopPropagation();
        canDrag.value = false;
        const right = (trackRightRef.value?.$el || trackRightRef.value) as HTMLElement;
        mr = new MouseCtl(right);
        const { width } = track;
        mr.moveCallback = function () {
          let dx = this.x - this.lastX;
          if (dx > 0 && ['video', 'audio'].includes(track.type)) {
            dx = dx > width - track.width ? width - track.width : dx;
          }
          dx = track.width - dx < 20 ? 0 : dx;

          track.end += dx; //
          track.width += dx;
        };

        mr.upCallback = function () {
          canDrag.value = true;
        };
      };

      const offTrackLeft = (e: MouseEvent) => {
        e.stopPropagation();
        canDrag.value = true;
        if (ml) ml.moveCallback = () => {};
      };
      const offTrackRight = (e: MouseEvent) => {
        e.stopPropagation();
        canDrag.value = true;
        if (mr) mr.moveCallback = () => {};
      };

      const trackBorder = (track: TrackItem) =>
        track.active ? (
          <div class="absolute w-full h-full top-0 left-0">
            <div
              ref={trackLeftRef}
              onPointerover={(e: MouseEvent) => onTrackLeft(e, track)}
              onPointerleave={(e: MouseEvent) => offTrackLeft(e)}
              class="track-scale track-scale-left -left-0"
            >
              <MoreOutlined class="absolute -left-1 w-2" />
            </div>
            <div
              ref={trackRightRef}
              onPointerover={(e: MouseEvent) => onTrackRight(e, track)}
              onPointerleave={(e: MouseEvent) => offTrackRight(e)}
              class="track-scale  track-scale-right right-0"
            >
              <MoreOutlined class="absolute -right-1" />
            </div>
          </div>
        ) : (
          ''
        );

      /*
        lists
      */
      const trackListsRef = ref<ComponentPublicInstance | null>(null);
      let mtrak: MouseCtl | null = null;
      const activeTrak = ref<null | TrackItem>(null);
      const draggedIdxs = reactive({ i: -1, j: -1 });
      watch(draggedIdxs, (idxs: { i: number; j: number }) => {
        const { i, j } = idxs;
        if (i === -1 || j === -1) return;
        if (activeTrak.value) activeTrak.value.active = false;
        activeTrak.value = lists.value[i][j];
        activeTrak.value.active = true;
      });

      const shadowDx = ref(0);
      const shadowLeft = computed(() => {
        const { i, j } = draggedIdxs;
        const currentlist = lists.value[i];
        let l = currentlist.slice(0, j).reduce((l, trak) => (l += trak.width + trak.marginLeft), 0);
        return l + currentlist[j].marginLeft;
      });

      const isListActive = (tracks: TrackItem[]) => {
        let active = false;
        tracks.forEach((track) => {
          if (track.active) active = true;
        });
        return active;
      };

      const onTrackDown = (e: MouseEvent, track: TrackItem, i: number, j: number) => {
        e.stopPropagation();
        draggedIdxs.i = i;
        draggedIdxs.j = j;

        const trakList = (trackListsRef.value?.$el || trackListsRef.value) as HTMLElement;
        const trak = trakList.children[i].children[j] as HTMLElement;
        mtrak = new MouseCtl(trak);
        mtrak.moveCallback = function () {
          if (!canDrag.value) return;

          let dx = this.x - this.lastX;
          let dy = this.y - this.lastY;
          const style = getComputedStyle(this.element);
          const left = parseInt(style.left) + dx;

          shadowDx.value = left;
          this.element.style.left = `${left}px`;
          this.element.style.top = `${parseInt(style.top) + dy}px`;
          this.element.style.zIndex = '10';
        };

        mtrak.upCallback = function () {
          const { i, j } = draggedIdxs;
          if (i === -1 || j === -1) return;

          const l = track.marginLeft;
          let r = 1920 - track.width;
          const nextTrak = lists.value[i][j + 1];
          if (nextTrak) r = nextTrak.marginLeft;

          let dx = parseInt(this.element.style.left);
          dx = Number.isNaN(dx) ? 0 : dx;
          dx = dx < 0 ? (dx < -l ? -l : dx) : dx > r ? r : dx;

          track.marginLeft = l + dx;
          if (nextTrak) nextTrak.marginLeft -= dx;

          shadowDx.value = 0;
          this.element.style.left = '0';
          this.element.style.top = '0';
          this.element.style.zIndex = '0';
          draggedIdxs.i = -1;
          draggedIdxs.j = -1;
        };
      };
      const onClickOutside = (track: TrackItem) => {
        track.active = false;
      };

      const trackList = (tracks: TrackItem[], i: number) => (
        <div
          class={[
            'track-list relative flex w-full my-2',
            isListActive(tracks) ? 'track-list-active' : '',
          ]}
        >
          {tracks.map((track: TrackItem, j: number) => {
            return (
              <div
                class={[
                  'track-item rounded-sm overflow-hidden text-xs mr-px relative px-1',
                  `track-item-${track.type}`,
                  track.active ? 'border-white border' : '',
                ]}
                style={`flex:0 0 ${track.width}px; margin-left: ${track.marginLeft}px;`}
                onPointerdown={(e: MouseEvent) => onTrackDown(e, track, i, j)}
                v-clickOutside={() => onClickOutside(track)}
              >
                {trackMap[track.type as keyof typeof trackMap](track)}

                {trackBorder(track)}
              </div>
            );
          })}
          {draggedIdxs.i === i ? (
            <div
              class="shadow absolute rounded-sm m-px px-1 bg-gray-100 opacity-5 h-full"
              style={`width: ${Number(activeTrak.value?.width)}px;
              top:0; left: ${shadowLeft.value + shadowDx.value}px;`}
            ></div>
          ) : (
            ''
          )}
        </div>
      );

      return () => (
        <div class="flex w-full">
          <div class="track-container-head h-full" style={`flex:0 0 ${trackHeadWidth}px;`}>
            {slots.default ? slots.default() : ''}
          </div>
          <div ref={trackListsRef} class="list w-full h-full flex flex-col justify-center">
            {lists.value.map((tracks, i) => trackList(tracks, i))}
          </div>
        </div>
      );
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

    &-filter {
      background-color: #464186;
    }

    &-title {
      display: flex;
      align-items: center;
      height: 1rem;
      padding: 0 1px;
      margin: 0 0.25rem;
      border-radius: 0.125rem;
      background-color: rgba(255, 255, 255, 0.1);
      white-space: nowrap;
      overflow: hidden;
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

<style lang="less">
  .video-container {
    .track-list:first-child {
      margin-top: 2.5rem;
    }
  }
</style>
