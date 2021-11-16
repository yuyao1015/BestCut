<script lang="tsx">
  import type { AudioTrackItem, TrackItem, VideoTrackItem } from '#/track';
  import type { PropType, ComponentPublicInstance } from 'vue';

  import { computed, h, defineComponent, ref, watch } from 'vue';

  import { ClickOutside } from '@/directives';
  import { MouseCtl } from '@/logic/mouse';

  import { trackHeadWidth } from '@/settings/componentSetting';
  import { getShapedArrary } from '@/utils';

  import { searchMainIdx, updateMainOrder, updateOrder, searchColIdx, deleteTrack } from './track';

  import TrackBorder from './TrackBorder.vue';

  const NO_SELECT = { i: -1, j: -1 };

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
      isMute: {
        type: Boolean,
        default: false,
      },
    },
    emits: [],
    setup(props, { slots }) {
      const lists = computed(() => props.lists);
      const isMain = computed(() => {
        return Boolean(slots.default);
      });

      const getTrackHead = (track: TrackItem) => {
        return [track.trackName, track.duration];
      };

      const video = (track: VideoTrackItem) => (
        <div class="video-track h-full w-full">
          <div class="track-item-head">
            {(props.isMute ? ['已静音', ...getTrackHead(track)] : getTrackHead(track)).map(
              (title) => (
                <span class="track-item-title">{title}</span>
              )
            )}
          </div>
          <div class="h-10">cover</div>
          <div class="h-5">foot wave</div>
        </div>
      );

      const audio = (track: AudioTrackItem) => (
        <div class="audio-track h-full w-full">
          <div class="track-item-head">
            {getTrackHead(track).map((title) => (
              <span class="track-item-title">{title}</span>
            ))}
          </div>
          <div class="h-8">{track.wave}</div>
        </div>
      );

      const attachment = (track: TrackItem) => (
        <div class={'attachment-track track-item-head w-full'}>
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

      const canDrag = ref(true);
      const mtraks: (MouseCtl | null)[][] = getShapedArrary(lists.value, null);
      const trackListsRef = ref<ComponentPublicInstance | null>(null);
      const draggedIdxs = ref(NO_SELECT);
      const activeIdxs = ref(NO_SELECT);
      const activeTrak = ref<null | TrackItem>(null);
      watch(activeIdxs, (idxs: { i: number; j: number }) => {
        const { i, j } = idxs;
        if (i === -1 || j === -1) return;
        if (activeTrak.value) activeTrak.value.active = false;
        activeTrak.value = lists.value[i][j];
        if (activeTrak.value) activeTrak.value.active = true;
      });

      const shadowDx = ref(0);
      const currentList = ref<TrackItem[]>([]);
      const shadowLeft = computed(() => {
        const { j } = draggedIdxs.value;
        let l = currentList.value
          .slice(0, j)
          .reduce((l, trak) => (l += trak.width + trak.marginLeft), 0);
        return Math.max(l + currentList.value[j].marginLeft + shadowDx.value, 0);
      });

      const swapMainTrack = (list: TrackItem[], dx: number, j: number) => {
        // index in dragging
        const idx = searchMainIdx(list, dx, j);

        if (dx > 0) {
          for (let k = j + 1; k < list.length; k++) {
            if (k < idx + 1) {
              list[k].marginLeft = -list[j].width;
              if (k === idx) list[k].marginRight = list[j].width;
              shadowDx.value += list[k].width;
            } else {
              list[k].marginLeft = 0;
              list[k].marginRight = 0;
            }
          }
        }

        if (dx < 0) {
          for (let k = j - 1; k >= 0; k--) {
            if (k > idx - 1) {
              list[k].marginRight = -list[j].width;
              if (k === idx) list[k].marginLeft = list[j].width;
              shadowDx.value -= list[k].width;
              shadowDx.value -= list[j].width;
            } else {
              list[k].marginLeft = 0;
              list[k].marginRight = 0;
            }
          }
        }
      };

      const newListLine = ref({ i: -1, top: true });
      const requestNewList = () => {
        let tid: any;

        return {
          cancel: () => {
            if (tid) clearTimeout(tid);
          },
          createNewList: () => {
            tid = setTimeout(() => {
              console.log('hover');
            }, 300);
          },
        };
      };
      requestNewList();

      const onTrackDown = (e: MouseEvent, track: TrackItem, i: number, j: number) => {
        e.stopPropagation();
        activeIdxs.value = draggedIdxs.value = { i, j };

        window.addEventListener('keydown', onShortcut);
        window.addEventListener('keyup', offShortcut);

        const trakLists = (trackListsRef.value?.$el || trackListsRef.value) as HTMLElement;
        const trak = trakLists.children[i].children[j] as HTMLElement;

        const style = getComputedStyle(trakLists.children[i]);
        const my = parseInt(style.marginTop) + parseInt(style.marginBottom);

        let mtrak = mtraks[i][j];
        if (!mtrak) mtraks[i][j] = mtrak = new MouseCtl(trak);

        const currentlist = (currentList.value = lists.value[i]);

        // drag effect on view
        mtrak.moveCallback = function () {
          if (!canDrag.value) return;

          let dx = this.x - this.lastX;
          let dy = this.y - this.lastY;
          const style = getComputedStyle(this.element);
          const left = parseInt(style.left) + dx;
          const top = parseInt(style.top) + dy;

          const { idx, newListVisiable } = searchColIdx(lists.value, top, my, i);

          draggedIdxs.value.i = idx;
          if (newListVisiable) {
            newListLine.value.i = idx;
            newListLine.value.top = top <= 0;
            draggedIdxs.value.i = -1;
          } else {
            newListLine.value.i = -1;
            draggedIdxs.value.i = idx;
          }

          if (isMain.value && idx === i) {
            swapMainTrack(currentlist, left, j);
          } else {
            shadowDx.value = left;
          }

          this.element.style.left = `${left}px`;
          this.element.style.top = `${top}px`;
          this.element.style.zIndex = '10';
        };

        // update change after dragging
        mtrak.upCallback = function () {
          let dx = parseInt(this.element.style.left);
          let dy = parseInt(this.element.style.top);
          dx = Number.isNaN(dx) ? 0 : dx;
          dy = Number.isNaN(dy) ? 0 : dy;

          const { idx } = searchColIdx(lists.value, dy, my, i);
          const newListVisiable = newListLine.value.i !== -1;
          const placeTop = newListLine.value.top;

          const trak = Object.assign({}, track);
          if (newListVisiable) {
            trak.marginLeft = shadowLeft.value;
            lists.value.splice(idx + 1 - +placeTop, 0, [trak]);
            activeIdxs.value = { i: idx, j: 0 };
            deleteTrack(lists.value, i + +placeTop, j, isMain.value);
          } else {
            // horizontal
            if (idx === i) {
              if (isMain.value) {
                updateMainOrder(currentlist, dx, j);
              } else {
                updateOrder(currentlist, dx, j);
              }
              // vertical
            } else {
              const dstList = lists.value[idx];
              dstList[0].marginLeft -= trak.width;
              trak.marginLeft = 0;
              dstList.unshift(trak);
              const { idx: row } = updateOrder(dstList, shadowLeft.value, 0);
              activeIdxs.value = { i: idx, j: row };
              deleteTrack(lists.value, i, j, isMain.value);
            }
          }

          this.element.style.left = '0px';
          this.element.style.top = '';
          this.element.style.zIndex = '';
          shadowDx.value = 0;
          newListLine.value.i = -1;
          draggedIdxs.value = NO_SELECT;
        };
      };

      const shortcutEvent = () => {
        let isCtrlPressing = false;
        return {
          onShortcut: (e: KeyboardEvent) => {
            if (e.code === 'Space') {
              e.preventDefault();
            } else if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {
              isCtrlPressing = true;
            } else if (e.code === 'Backspace') {
              if (isCtrlPressing) {
                const { i, j } = activeIdxs.value;
                deleteTrack(lists.value, i, j, isMain.value);
                (mtraks[i][j] as MouseCtl).moveCallback = () => {};
                (mtraks[i][j] as MouseCtl).upCallback = () => {};
                activeIdxs.value = NO_SELECT;
                draggedIdxs.value = NO_SELECT;
              }
            }
          },
          offShortcut: () => {
            isCtrlPressing = false;
          },
        };
      };
      const { onShortcut, offShortcut } = shortcutEvent();

      const onClickOutside = (track: TrackItem) => {
        if (track.active) {
          track.active = false;
          activeIdxs.value = NO_SELECT;
          window.removeEventListener('keydown', onShortcut);
          window.removeEventListener('keyup', offShortcut);
        }
      };

      const trackList = (tracks: TrackItem[], i: number) => (
        <div
          class={[
            'track-list relative flex w-full my-2',
            draggedIdxs.value.i === i || (draggedIdxs.value.i === -1 && activeIdxs.value.i === i)
              ? 'track-list-active'
              : '',
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
                style={`flex:0 0 ${track.width}px;
                    height: ${track.height}px;
                    margin-left: ${track.marginLeft}px;
                    margin-right: ${track.marginRight}px;
                    `}
                onPointerdown={(e: MouseEvent) => onTrackDown(e, track, i, j)}
                v-clickOutside={() => onClickOutside(track)}
              >
                {trackMap[track.type as keyof typeof trackMap](track)}

                {track.active
                  ? h(TrackBorder, {
                      track,
                      i,
                      j,
                      lists: lists.value,
                      canDrag: canDrag.value,
                      'onUpdate:canDrag': (value: boolean) => {
                        canDrag.value = value;
                      },
                    })
                  : null}
              </div>
            );
          })}

          {draggedIdxs.value.i === i ? (
            <div
              class="shadow absolute rounded-sm m-px px-1 bg-gray-300 opacity-10 h-full"
              style={`width: ${Number(activeTrak.value?.width)}px;
                  top:0; left: ${shadowLeft.value}px;`}
            />
          ) : null}

          {newListLine.value.i === i ? (
            <div
              class="new-list-line absolute w-full h-0.5 left-0"
              style={`transform: translateY(${newListLine.value.top ? '-' : ''}0.6rem);
                    ${newListLine.value.top ? 'top' : 'bottom'}: 0;`}
            ></div>
          ) : null}
        </div>
      );

      return () => (
        <div class="flex w-full">
          <div class="track-container-head h-full" style={`flex:0 0 ${trackHeadWidth}px;`}>
            {slots.default ? slots.default() : null}
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

  .new-list-line {
    background: #276161;
  }
</style>

<style lang="less">
  .video-container {
    .track-list:first-child {
      margin-top: 2.5rem;
    }
  }
</style>
