<script lang="tsx">
  import type { PropType, ComponentPublicInstance } from 'vue';

  import { isMedia, TrackMap, TrackItem } from '@/logic/track';
  import { computed, defineComponent, ref, watch, nextTick } from 'vue';

  import { ClickOutside } from '@/directives';
  import { MouseCtl } from '@/logic/mouse';

  import { trackHeadWidth } from '@/settings/trackSetting';
  import { getShapedArrary } from '@/utils';
  import { useTrackStore } from '@/store/track';

  import {
    searchMainIdx,
    updateMainOrder,
    updateOrder,
    searchRowIdx,
    searchColIdx,
    deleteTrack,
  } from './track';

  import TrackBorder from './TrackBorder.vue';
  import Track from '@/components/Track.vue';
  import { ResourceType } from '@/enums/resource';
  // import { getStyle } from '@/utils/dom';

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
      type: {
        type: String,
        default: '',
      },
      isMapEmpty: {
        type: Boolean,
        default: false,
      },
    },
    emits: [],
    setup(props, { slots }) {
      const lists = computed(() => props.lists);
      const isMain = computed(() => {
        return props.type === 'main';
      });

      const trackStore = useTrackStore();
      const updateMap = (track: TrackItem, lists: TrackItem[][]) => {
        let type: keyof TrackMap | undefined;
        if (!isMedia(track.type)) type = 'video';
        else if (track.type === ResourceType.Video && track.marginLeft === 0) type = 'main';
        trackStore.updateMap(type === 'main' ? lists[0] : lists, type);
      };

      const canDrag = ref(true);
      const mtraks: (MouseCtl | null)[][] = getShapedArrary(lists.value, null);
      const trackListsRef = ref<ComponentPublicInstance | null>(null);
      const draggedIdxs = ref({ i: -1, j: -1 });
      const activeIdxs = ref({ i: -1, j: -1 });
      const activeTrak = ref<undefined | TrackItem>(undefined);
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
        if (!currentList.value[j]) return shadowDx.value;

        const l = currentList.value
          .slice(0, j)
          .reduce((l, trak) => l + trak.width + trak.marginLeft, 0);
        const ml = currentList.value[j]?.marginLeft || 0;
        return Math.max(l + ml + shadowDx.value, 0);
      });

      const swapMainTrack = (list: TrackItem[], dx: number, j: number, track?: TrackItem) => {
        // index in dragging
        shadowDx.value = 0;
        let { idx, dx: _dx } = searchMainIdx(list, dx, j);

        if (track) {
          if (_dx >= 20) idx++;
          for (let k = j + 1; k < list.length; k++) {
            if (k < idx) {
              shadowDx.value += list[k].width;
            }
            if (k === idx) list[idx].marginLeft = track.width;
            else {
              list[k].marginLeft = 0;
              list[k].marginRight = 0;
            }
          }
          return;
        }

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
        let tid: number;

        return {
          cancel: () => {
            if (tid) clearTimeout(tid);
          },
          createNewList: (i: number, placeTop: boolean) => {
            if (tid) clearTimeout(tid);
            tid = window.setTimeout(() => {
              newListLine.value.i = i;
              newListLine.value.top = placeTop;
              draggedIdxs.value.i = -1;
            }, 500);
          },
        };
      };

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

        const newListRequestor = requestNewList();
        const _track = Object.assign({}, track, { marginLeft: -track.width });
        // drag effect on view
        mtrak.moveCallback = function () {
          if (!canDrag.value) return;

          let dx = this.x - this.lastX;
          let dy = this.y - this.lastY;
          const style = getComputedStyle(this.element);
          const left = parseInt(style.left) + dx;
          const top = parseInt(style.top) + dy;

          const { idx, newListVisiable, canRequestNewList } = searchColIdx(lists.value, top, my, i);

          if (dx === 0 && dy === 0 && canRequestNewList) {
            newListRequestor.createNewList(idx, top <= 0);
          } else {
            draggedIdxs.value.i = idx;
          }

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
            if (idx !== i) {
              const dummyList = lists.value[idx].map((track) => Object.assign({}, track));
              dummyList.unshift(_track);
              const { overlap } = searchRowIdx(dummyList, shadowLeft.value + _track.width, 0);
              if (overlap) {
                draggedIdxs.value.i = i;
              } else draggedIdxs.value.i = idx;
            }
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

          if (newListVisiable) {
            _track.marginLeft = shadowLeft.value;
            const insertedIdx = idx + 1 - +placeTop;
            const removedIdx = i + +placeTop;
            lists.value.splice(insertedIdx, 0, [_track]);
            activeIdxs.value = {
              i:
                insertedIdx > removedIdx && lists.value[removedIdx].length === 1
                  ? insertedIdx - 1
                  : insertedIdx,
              j: 0,
            };
            deleteTrack(lists.value, removedIdx, j, isMain.value);
            updateMap(_track, lists.value);
          } else {
            // horizontal
            if (idx === i) {
              if (isMain.value) {
                updateMainOrder(currentlist, dx, j);
              } else {
                updateOrder(currentlist, dx, j);
              }
              updateMap(lists.value[i][j], lists.value);
              // vertical
            } else {
              const dstList = lists.value[idx];
              dstList.unshift(_track);
              const { idx: _j, overlap } = searchRowIdx(
                dstList,
                shadowLeft.value + _track.width,
                0
              );
              if (overlap) {
                dstList.shift();
              } else {
                updateOrder(dstList, shadowLeft.value + _track.width, 0);
                activeIdxs.value = {
                  i: idx > i && currentlist.length === 1 ? idx - 1 : idx,
                  j: _j,
                };
                deleteTrack(lists.value, i, j, isMain.value);
                updateMap(_track, lists.value);
              }
            }
          }

          newListRequestor.cancel();
          this.element.style.left = '0px';
          this.element.style.top = '';
          this.element.style.zIndex = '';
          shadowDx.value = 0;
          newListLine.value.i = -1;
          draggedIdxs.value = { i: -1, j: -1 };
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
                const track = lists.value[i][j];
                deleteTrack(lists.value, i, j, isMain.value);
                (mtraks[i][j] as MouseCtl).moveCallback = () => {};
                (mtraks[i][j] as MouseCtl).upCallback = () => {};
                activeIdxs.value = { i: -1, j: -1 };
                draggedIdxs.value = { i: -1, j: -1 };
                updateMap(track, lists.value);
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
          activeIdxs.value = { i: -1, j: -1 };
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
          {isMain.value && !tracks.length ? (
            <div
              class={[
                'rounded-md w-full h-20 border border-light-50 border-dashed',
                'flex items-center justify-start pl-10 opacity-50',
              ]}
              style="background-color: rgba(255, 255, 255, 0.1);"
            >
              视频拖拽到这里
            </div>
          ) : (
            tracks.map((track: TrackItem, j: number) => {
              return (
                <Track
                  track={track}
                  isMute={props.isMute}
                  onPointerdown={(e: PointerEvent) => onTrackDown(e, track, i, j)}
                  v-clickOutside={() => onClickOutside(track)}
                >
                  {track.active ? (
                    <TrackBorder
                      track={track}
                      i={i}
                      j={j}
                      lists={lists.value}
                      v-model={[canDrag.value, 'canDrag']}
                    />
                  ) : null}
                </Track>
              );
            })
          )}

          {draggedIdxs.value.i === i && activeTrak.value ? (
            <div
              class="shadow absolute rounded-sm m-px px-1 bg-gray-300 opacity-10 h-full"
              style={`width: ${Number(activeTrak.value.width)}px;
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

      let enterCnt = 0;
      const onResourceEnter = () => {
        if (enterCnt === 0) {
          // console.log('enter');
        }
        enterCnt++;

        if (enterCnt !== 1) return;
        trackStore.setResourceOverState(true);
        nextTick(() => {
          if (props.isMapEmpty) {
            //
          } else {
            // console.log(activeIdxs.value, activeTrak.value?.active);
            if (activeTrak.value) activeTrak.value.active = false;
          }
          activeTrak.value = trackStore.track?.clone();
        });
      };

      const onResourceLeave = () => {
        enterCnt--;
        if (enterCnt !== 0) return;
        // console.log('leave');
        activeIdxs.value.i = -1;
        draggedIdxs.value.i = -1;
        activeTrak.value = undefined;

        if (isMain.value) {
          for (const trak of lists.value[0]) {
            trak.marginRight = 0;
            trak.marginLeft = 0;
          }
        }
      };

      const onResourceOver = (e: DragEvent) => {
        const container = (e.currentTarget as HTMLElement).children[1];
        const rect = container.getBoundingClientRect();
        const dx = e.pageX - rect.left;

        if (props.isMapEmpty) {
          draggedIdxs.value.i = activeIdxs.value.i = 0;
          return;
        }

        if (isMain.value) {
          if (activeTrak.value?.type === ResourceType.Video) {
            if (dx > 0) draggedIdxs.value.i = 0;
            else draggedIdxs.value.i = -1;
            swapMainTrack(lists.value[0], dx + 20, -1, trackStore.track?.clone());
          }
        } else {
          let dy = e.pageY - rect.top;
          if (!lists.value.length || !container.children.length || !dy) return;

          let style;
          if (props.type === 'video') style = getComputedStyle(container.children[0]);
          if (props.type === 'audio')
            style = getComputedStyle(container.children[container.children.length - 1]);
          if (!style) return;

          const mt = parseInt(style.marginTop);
          const mb = parseInt(style.marginBottom);
          const my = Math.min(mt, mb) * 2;

          const {
            idx,
            dy: _dy,
            newListVisiable,
            canRequestNewList,
          } = searchColIdx(lists.value, dy - (props.type === 'video' ? mt : my), my, -1);

          console.log(dy, _dy, newListVisiable, canRequestNewList);

          draggedIdxs.value.i = idx;

          if (
            lists.value[lists.value.length - 1][0].height < _dy ||
            (props.type === 'video' && dy < mt - mb)
          ) {
            draggedIdxs.value.i = -1;
          }
        }

        e.preventDefault();
      };

      const onResourceDrop = (e: DragEvent) => {
        const container = (e.currentTarget as HTMLElement).children[1];
        const dx = e.pageX - container.getBoundingClientRect().left;

        if (props.isMapEmpty && trackStore.track) {
          lists.value[0].push(trackStore.track.clone());
          activeIdxs.value = { i: 0, j: 0 };
          return;
        }

        if (isMain.value) {
          updateMainOrder(lists.value[0], dx, -1, trackStore.track?.clone());
        }

        draggedIdxs.value.i = -1;

        enterCnt = 0;
        trackStore.setResourceOverState(false);
      };

      return () => (
        <div
          class="flex w-full"
          onDragenter={onResourceEnter}
          onDragover={onResourceOver}
          onDragleave={onResourceLeave}
          onDrop={onResourceDrop}
        >
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
  .track-list-active {
    background-color: #383839;
    border-top: solid 1px #4d4d4e;
    border-bottom: solid 1px #4d4d4e;
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

  .audio-container {
    .track-list:last-child {
      margin-bottom: 2.5rem;
    }
  }
</style>
