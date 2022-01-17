<script lang="tsx">
  import { PropType, ComponentPublicInstance, reactive } from 'vue';

  import { isMedia, isVideo, isAudio, TrackMap, TrackItem } from '@/logic/track';
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
  import { ContainerType } from '@/enums/track';

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
      type: {
        type: String as PropType<ContainerType>,
        default: '',
      },
    },
    setup(props, { slots, attrs }) {
      const lists = computed(() => props.lists);
      const inMain = () => props.type === ContainerType.Main;
      const inVideo = () => props.type === ContainerType.Video;
      const inAudio = () => props.type === ContainerType.Audio;

      const trackStore = useTrackStore();
      const updateMap = (track: TrackItem, lists: TrackItem[][]) => {
        let type = track.type as keyof TrackMap;
        if (!isMedia(track.type)) type = 'video';
        else if (isVideo(track.type) && track.marginLeft === 0) type = 'main';
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

      watch(lists.value, (newVal: TrackItem[][], oldVal: TrackItem[][]) => {
        if (oldVal.length === 0 && newVal.length === 1) {
          activeIdxs.value = { i: 0, j: 0 };
        }
      });

      // new list line for empty container
      watch(
        () => trackStore._area,
        (newVal: ContainerType) => {
          if (newVal !== ContainerType.None) {
            if (activeTrak.value) {
              activeTrak.value.active = false;
              activeIdxs.value = { i: -1, j: -1 };
            }
            if (trackStore.isMapEmpty) {
              nextTick(() => {
                if (isVideo(trackStore.track?.type)) draggedIdxs.value.i = 0;
                else if (isAudio(trackStore.track?.type)) newListLine.value = { i: 0, top: false };
                else newListLine.value = { i: 0, top: true };
                return;
              });
            }
          } else {
            newListLine.value.i = -1;
          }

          if (inMain()) {
            nextTick(() => {
              if (
                newVal === ContainerType.Video &&
                trackStore.isVideoEmpty &&
                !isAudio(trackStore.track?.type)
              ) {
                setTimeout(() => {
                  newListLine.value = { i: 0, top: true };
                }, 0);
              }
              if (
                newVal === ContainerType.Audio &&
                trackStore.isAudioEmpty &&
                isAudio(trackStore.track?.type)
              ) {
                setTimeout(() => {
                  newListLine.value = { i: 0, top: false };
                }, 0);
              }
            });
          }
        }
      );

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
        let last = -1;

        return {
          tid() {
            return tid;
          },
          cancel: () => {
            if (tid) clearTimeout(tid);
            newListLine.value.i = -1;
            last = -1;
            tid = 0;
          },
          createNewList: (i: number, placeTop: boolean) => {
            if (tid) {
              clearTimeout(tid);
              // if (last !== -1) draggedIdxs.value.i = last;
              last = -1;
            }
            tid = window.setTimeout(() => {
              newListLine.value.i = i;
              newListLine.value.top = placeTop;
              last = draggedIdxs.value.i;
              draggedIdxs.value.i = -1;
              tid = 0;
            }, 500);
          },
        };
      };

      const newListRequestor = requestNewList();
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

          if (inMain() && idx === i) {
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
            deleteTrack(lists.value, removedIdx, j, inMain());
            updateMap(_track, lists.value);
          } else {
            // horizontal
            if (idx === i) {
              if (inMain()) {
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
                deleteTrack(lists.value, i, j, inMain());
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
                deleteTrack(lists.value, i, j, inMain());
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
          {inMain() && !tracks.length ? (
            <div
              class={[
                'rounded-md w-full flex items-center justify-start pl-10 opacity-50 mr-2',
                !trackStore.isMapEmpty || trackStore.isResourceOver
                  ? 'h-24'
                  : 'border border-light-50 border-dashed h-20',
              ]}
              style="background-color: rgba(255, 255, 255, 0.1);"
            >
              <div>
                {!trackStore.isMapEmpty || trackStore.isResourceOver ? null : (
                  <span>视频拖拽到这里</span>
                )}
              </div>
            </div>
          ) : (
            tracks.map((track: TrackItem, j: number) => {
              return (
                <Track
                  track={track}
                  isMute={attrs.isMute as boolean}
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
              class="shadow absolute rounded-sm m-px px-1 bg-gray-300 opacity-10 h-full pointer-events-none"
              style={`width: ${Number(activeTrak.value.width)}px;
                      top:0; left: ${shadowLeft.value}px;`}
            />
          ) : null}

          {newListLine.value.i === i ? (
            <div
              class="new-list-line absolute w-full h-0.5 left-0 pointer-events-none"
              style={`transform: translateY(${newListLine.value.top ? '-' : ''}0.6rem);
                        ${newListLine.value.top ? 'top' : 'bottom'}: 0;`}
            ></div>
          ) : null}
        </div>
      );

      let enterCnt = 0;
      const onResourceEnter = () => {
        if (enterCnt === 0) {
          console.log('enter');
        }
        enterCnt++;

        if (enterCnt !== 1) return;
        const type = inMain()
          ? ContainerType.Main
          : inVideo()
          ? ContainerType.Video
          : ContainerType.Audio;
        trackStore.setArea(type);

        nextTick(() => {
          activeTrak.value = trackStore.track?.clone();
        });
      };

      const onResourceLeave = () => {
        enterCnt--;
        if (enterCnt !== 0) return;
        console.log('leave');
        draggedIdxs.value.i = activeIdxs.value.i = -1;
        activeTrak.value = undefined;
        newListRequestor.cancel();

        if (inMain()) {
          for (const trak of lists.value[0]) {
            trak.marginRight = 0;
            trak.marginLeft = 0;
          }
        }
      };

      const dragData = reactive({
        dx: 0,
        dy: 0,
        canRequestNewList: false,
        idx: -1,
        j: -1,
        overlap: false,
      });
      watch(dragData, () => {
        if (dragData.canRequestNewList) {
          newListRequestor.createNewList(dragData.idx, dragData.dy <= 0);
        }
      });
      const onResourceOver = (e: DragEvent) => {
        if (!trackStore.isResourceOver || !trackStore.track) return;
        e.preventDefault();

        const container = (e.currentTarget as HTMLElement).children[1];
        const rect = container.getBoundingClientRect();
        const dx = (dragData.dx = e.pageX - rect.left);
        let dy = e.pageY - rect.top;

        if (inMain()) {
          if (!trackStore.isMapEmpty) newListLine.value.i = -1;
          if (!isVideo(activeTrak.value?.type)) return;
          if (dx > 0) draggedIdxs.value.i = 0;
          else draggedIdxs.value.i = -1;
          swapMainTrack(lists.value[0], dx + 20, -1, trackStore.track.clone());
        } else {
          if (
            !lists.value.length &&
            ((inVideo() && !isAudio(trackStore.track?.type)) ||
              (inAudio() && isAudio(trackStore.track?.type)))
          ) {
            // for empty non-main container
            newListLine.value = { i: 0, top: false };
          }

          if (!lists.value.length || !container.children.length) return;

          let style;
          if (inVideo()) style = getComputedStyle(container.children[0]);
          if (inAudio())
            style = getComputedStyle(container.children[container.children.length - 1]);
          if (!style) return;

          const mt = parseInt(style.marginTop);
          const mb = parseInt(style.marginBottom);
          const my = Math.min(mt, mb) * 2;

          dy = dragData.dy = dy - (inVideo() ? mt : my);
          let {
            idx,
            dy: _dy,
            newListVisiable,
            canRequestNewList,
          } = searchColIdx(lists.value, dy, my, 0, trackStore.track.type);

          if (
            (inAudio() && !isAudio(trackStore.track.type)) ||
            (isVideo(trackStore.track.type) && idx < trackStore.videoIdx) ||
            (!isVideo(trackStore.track.type) &&
              !isAudio(trackStore.track.type) &&
              idx >= trackStore.videoIdx)
          )
            canRequestNewList = false;
          dragData.idx = idx;
          dragData.canRequestNewList = canRequestNewList;

          // console.log(newListVisiable, canRequestNewList, idx, newListLine.value, dy, _dy);
          // hover over video container
          if (newListVisiable && inVideo() && !isAudio(trackStore.track.type)) {
            const { type } = lists.value[idx][0];
            if (isVideo(trackStore.track.type)) {
              if (type !== trackStore.track.type)
                newListLine.value = { i: trackStore.videoIdx, top: true };
              else newListLine.value = { i: idx, top: dy <= 0 };
            } else {
              let _idx = dy < 0 ? idx : idx + +canRequestNewList;
              if (type !== trackStore.track.type && isVideo(type)) _idx = trackStore.videoIdx;
              if (newListRequestor.tid() || draggedIdxs.value.i !== -1) _idx = -1;
              newListLine.value = { i: _idx, top: true };
            }
            draggedIdxs.value.i = -1;
          }

          // hover over audio container
          if (newListVisiable && inAudio() && isAudio(trackStore.track.type)) {
            newListLine.value = { i: idx, top: dy <= 0 };
            draggedIdxs.value.i = -1;
          }

          if (!newListVisiable) {
            newListLine.value.i = -1;
            draggedIdxs.value.i = idx;
          }

          // margin area
          if (lists.value[lists.value.length - 1][0].height < _dy || (inVideo() && dy < 0)) {
            draggedIdxs.value.i = -1;
          }

          if (draggedIdxs.value.i !== -1) {
            const dummyList = lists.value[idx].map((track) => Object.assign({}, track));
            dummyList.unshift(trackStore.track);
            const { idx: j, overlap } = searchRowIdx(dummyList, dx + trackStore.track.width, 0);
            dragData.j = j;
            dragData.overlap = overlap;
            if (overlap) {
              // newListLine.value = { i: draggedIdxs.value.i + 1, top: dy <= 0 };
              draggedIdxs.value.i = -1;
            } else shadowDx.value = dx;
          }
        }
      };

      const onResourceDrop = () => {
        if (!trackStore.track) return onDrop();
        const { dx, idx, j, overlap } = dragData;
        let track = trackStore.track.clone();

        if (trackStore.isMapEmpty) {
          if (isVideo(trackStore.track?.type)) {
            lists.value[0].push(trackStore.track.clone());
            activeIdxs.value = { i: 0, j: lists.value[0].length - 1 };
          } else {
            track.marginLeft = dx;
            updateMap(track, [[track]]);
          }
          return onDrop();
        }

        if (inMain() && isVideo(track.type)) {
          const j = updateMainOrder(lists.value[0], dx, -1, track);
          activeIdxs.value = { i: 0, j };
        }

        // create new track list
        if (!inMain() && newListLine.value.i !== -1) {
          track.marginLeft = dx;
          const offset = trackStore.isVideoEmpty ? idx >= newListLine.value.i : 1;
          const insertedIdx = newListLine.value.i + +offset - +newListLine.value.top;

          // console.log(insertedIdx, idx, newListLine.value);
          lists.value.splice(insertedIdx, 0, [track]);
          activeIdxs.value = { i: insertedIdx, j: 0 };
        }

        // insert into exist track list
        if (!inMain() && newListLine.value.i === -1 && draggedIdxs.value.i !== -1) {
          track.marginLeft = -track.width;
          const dstList = lists.value[draggedIdxs.value.i];
          dstList.unshift(track);
          if (overlap) {
            dstList.shift();
          } else {
            updateOrder(dstList, dx + track.width, 0);
            activeIdxs.value = { i: draggedIdxs.value.i, j };
          }
        }

        onDrop();
      };

      const onDrop = () => {
        enterCnt = 0;
        newListRequestor.cancel();
        trackStore.setArea(ContainerType.None);
        draggedIdxs.value.i = -1;
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
