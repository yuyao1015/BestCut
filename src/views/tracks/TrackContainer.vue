<template>
  <div
    class="flex w-full"
    @dragenter="onTrackEnter"
    @dragover="onTrackOver"
    @dragleave="onTrackLeave"
    @dragend="onTrackend"
    @drop="onTrackDrop"
  >
    <div class="track-container-head h-full" :style="`flex:0 0 ${TrackHeadWidth}px;`">
      <slot></slot>
    </div>

    <div class="list w-full h-full flex flex-col justify-center">
      <div
        v-for="(tracks, i) in lists"
        :key="i"
        :class="[
          'track-list relative flex w-full my-2',
          draggedIdxs.i === i || (draggedIdxs.i === -1 && activeIdxs.i === i)
            ? 'track-list-active'
            : '',
        ]"
      >
        <!-- PlaceholderInMain -->
        <div v-if="inMain() && !tracks.length">
          <div
            :class="[
              'rounded-md w-full flex items-center justify-start pl-10 opacity-50 mr-2',
              !trackStore.isMapEmpty() || trackStore.isResourceOver
                ? 'h-24'
                : 'border border-light-50 border-dashed h-20',
            ]"
            :style="'background-color: rgba(255, 255, 255, 0.1);'"
          >
            <div>
              <span v-if="!trackStore.isMapEmpty() || trackStore.isResourceOver">
                视频拖拽到这里
              </span>
            </div>
          </div>
        </div>

        <!-- TrackList -->
        <Track
          v-else
          v-for="(track, j) in tracks"
          :key="j"
          :track="track"
          :isMute="isMute"
          draggable="true"
          @dragstart="(e: DragEvent) => trackDragger.dragstart(e, track, i, j, props.type)"
          @pointerdown="(e: PointerEvent) => onTrackDown(e, track, i, j)"
          v-click-outside:[exclude]="() => onClickOutside(track)"
        >
          <TrackBorder
            v-if="track.active"
            :track="track"
            :i="i"
            :j="j"
            :lists="lists"
            v-model:canDrag="canDrag"
          />
        </Track>

        <!-- Shadow -->
        <div
          v-if="draggedIdxs.i === i && activeTrak"
          class="shadow absolute rounded-sm m-px px-1 bg-gray-300 opacity-10 h-full pointer-events-none"
          :style="`width: ${Number(activeTrak.width)}px;
                    top:0; left: ${shadowLeft}px;`"
        />

        <!-- NewTrackList -->
        <div
          v-if="newListLine.i === i"
          class="new-list-line absolute w-full h-0.5 left-0 pointer-events-none"
          :style="`transform: translateY(${newListLine.top ? '-' : ''}0.6rem);
                      ${newListLine.top ? 'top' : 'bottom'}: 0;`"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAttrs } from 'vue';
import { computed, ref, watch, nextTick, reactive, onMounted } from 'vue';

import { ClickOutside as vClickOutside } from '@/directives';

import { TrackHeadWidth } from '@/settings/tracksSetting';
import { useTrackStore } from '@/store/track';

import { isMedia, isVideo, isAudio, TrackMap, TrackItem } from '@/logic/tracks';
import { searchMainIdx, searchRowIdx, searchColIdx } from '@/logic/tracks/op';
import { updateMainOrder, updateOrder, deleteTrack } from '@/logic/tracks/op';

import TrackBorder from './TrackBorder.vue';
import Track from '@/components/Track.vue';
import { ContainerType } from '@/enums/track';
import useTrakDrag from '@/hooks/useTrakDrag';

type Props = {
  lists: TrackItem[][];
  type: ContainerType;
};
const props = withDefaults(defineProps<Props>(), {
  lists: () => [],
  type: ContainerType.OutSide,
});

const isMute = computed(() => useAttrs().isMute as boolean | undefined);

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

const trackDragger = useTrakDrag(draggedIdxs);
const inSameArea = () => trackDragger.getArea() === props.type;

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
        if (last !== -1) {
          // draggedIdxs.value.i = last;
        }
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

// new list line for empty container
watch(
  () => trackStore._area,
  (newVal: ContainerType) => {
    if (newVal !== ContainerType.OutSide) {
      if (activeTrak.value) {
        activeTrak.value.active = false;
        activeIdxs.value = { i: -1, j: -1 };
      }
      if (trackStore.isMapEmpty()) {
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
          trackStore.isVideoEmpty() &&
          !isAudio(trackStore.track?.type)
        ) {
          setTimeout(() => {
            newListLine.value = { i: 0, top: true };
          }, 0);
        }
        if (
          newVal === ContainerType.Audio &&
          trackStore.isAudioEmpty() &&
          isAudio(trackStore.track?.type)
        ) {
          setTimeout(() => {
            newListLine.value = { i: 0, top: false };
          }, 0);
        }

        if (
          newVal === ContainerType.Video &&
          trackDragger.i() !== -1 &&
          isVideo(trackStore.track?.type)
        ) {
          if (trackStore.track?.id === lists.value[0][trackDragger.j()]?.id)
            lists.value[0].splice(trackDragger.j(), 1);
          trackDragger.show();
          for (const trak of lists.value[0]) {
            trak.marginRight = 0;
            trak.marginLeft = 0;
          }
          draggedIdxs.value.i = -1;
          trackDragger.setArea(newVal);
        }
      });
    } else {
      if (newVal === ContainerType.Main) {
        newListRequestor.cancel();
        draggedIdxs.value.i = -1;
      }
    }
  }
);

const shadowDx = ref(0);
const shadowOffset = computed(() => {
  const currentlist = trackDragger.i() === -1 ? [] : lists.value[trackDragger.i()];
  if (!currentlist.length || !inSameArea()) return 0;
  return currentlist
    .slice(0, trackDragger.j())
    .reduce((l, trak) => l + trak.width + (inMain() ? 0 : trak.marginLeft), 0);
});
const shadowLeft = computed(() => {
  if (trackDragger.i() === -1) return shadowDx.value;
  const ml = inMain() ? 0 : lists.value[trackDragger.i()][trackDragger.j()].marginLeft;
  return Math.max(shadowOffset.value + ml + shadowDx.value, 0);
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
    return idx;
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
        // shadowDx.value -= list[j].width;
      } else {
        list[k].marginLeft = 0;
        list[k].marginRight = 0;
      }
    }
  }
  return idx;
};

const onTrackDown = (e: MouseEvent, track: TrackItem, i: number, j: number) => {
  e.stopPropagation();
  setTimeout(() => {
    trackStore.setTrack(track);
  }, 0);
  activeIdxs.value = { i, j };

  window.addEventListener('keydown', onShortcut);
  window.addEventListener('keyup', offShortcut);
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
    trackStore.setTrack(undefined);
    activeIdxs.value = { i: -1, j: -1 };
    window.removeEventListener('keydown', onShortcut);
    window.removeEventListener('keyup', offShortcut);
  }
};

let enterCnt = 0;
const onTrackEnter = () => {
  if (enterCnt === 0) {
    // console.log('enter');
  }
  enterCnt++;

  let type = ContainerType.Main;
  if (inVideo()) type = ContainerType.Video;
  if (inAudio()) type = ContainerType.Audio;
  trackStore.setArea(type);

  if (enterCnt !== 1) return;
  nextTick(() => {
    activeTrak.value = trackStore.track?.clone();
  });
};

const onTrackLeave = () => {
  enterCnt--;
  if (enterCnt !== 0) return;
  console.log('leave', props.type);
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

// drag effect on view
const onTrackOver = (e: DragEvent) => {
  if (!canDrag.value || !trackStore.isResourceOver || !trackStore.track) return;
  e.preventDefault();

  const container = (e.currentTarget as HTMLElement).children[1];
  const rect = container.getBoundingClientRect();
  let dx = (dragData.dx = e.pageX - rect.left - trackStore.offset);

  if (inMain()) {
    if (!trackStore.isMapEmpty()) newListLine.value.i = -1;
    if (!isVideo(activeTrak.value?.type)) return;
    if (dx > 0) draggedIdxs.value.i = 0;
    else draggedIdxs.value.i = -1;

    dragData.j = inSameArea()
      ? swapMainTrack(lists.value[0], dx - shadowOffset.value, trackDragger.j())
      : swapMainTrack(lists.value[0], dx + 20, -1, trackStore.track.clone());
    return;
  }

  shadowDx.value = dx - shadowOffset.value;

  if (
    !lists.value.length &&
    ((inVideo() && !isAudio(trackStore.track.type)) ||
      (inAudio() && isAudio(trackStore.track.type)))
  ) {
    // for empty non-main container
    newListLine.value = { i: 0, top: false };
  }

  if (!lists.value.length || !container.children.length) return;

  let style;
  if (inVideo()) style = getComputedStyle(container.children[0]);
  if (inAudio()) style = getComputedStyle(container.children[container.children.length - 1]);
  if (!style) return;

  const mt = parseInt(style.marginTop);
  const mb = parseInt(style.marginBottom);
  const my = Math.min(mt, mb) * 2;
  const dy = (dragData.dy = e.pageY - rect.top - (inVideo() ? mt : my));

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
      if (type !== trackStore.track.type) newListLine.value = { i: trackStore.videoIdx, top: true };
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

  if (draggedIdxs.value.i === -1) return;

  if (idx !== trackDragger.i()) {
    const dummyList = lists.value[idx].map((track) => Object.assign({}, track));
    dummyList.unshift(trackStore.track);
    let { idx: j, overlap } = searchRowIdx(dummyList, dx + trackStore.track.width, 0);
    if (overlap) {
      // newListLine.value = { i: draggedIdxs.value.i + 1, top: dy <= 0 };
      draggedIdxs.value.i = trackDragger.i();
    }

    Object.assign(dragData, { j, overlap });
  } else {
    const { idx: j, overlap } = searchRowIdx(
      lists.value[trackDragger.i()],
      dx - shadowOffset.value,
      trackDragger.j()
    );
    if (overlap) {
      draggedIdxs.value.i = -1;
    }
    Object.assign(dragData, { j, overlap });
  }
};

// update change after dragging
const onTrackDrop = (e: DragEvent) => {
  if (!trackStore.track) return;
  const { dx, idx, j, overlap } = dragData;
  const track = trackStore.track.clone();

  if (trackStore.isMapEmpty()) {
    if (isVideo(trackStore.track.type)) {
      lists.value[0].push(trackStore.track.clone());
      activeIdxs.value = { i: 0, j: lists.value[0].length - 1 };
    } else {
      track.marginLeft = dx;
      updateMap(track, [[track]]);
    }
    return;
  }

  // const { i, j } = trackDragger.getIdxs();

  if (inMain() && isVideo(track.type)) {
    inSameArea()
      ? updateMainOrder(lists.value[0], dx, trackDragger.j())
      : updateMainOrder(lists.value[0], dx + 20, -1, track);
    activeIdxs.value = { i: 0, j: dragData.j };
    draggedIdxs.value.i = -1;
  }

  if (inMain()) return;

  let removedIdx = trackDragger.i();
  // create new track list
  if (newListLine.value.i !== -1) {
    track.marginLeft = shadowLeft.value;
    const offset = trackStore.isVideoEmpty() ? idx >= newListLine.value.i : 1;
    const insertedIdx = newListLine.value.i + +offset - +newListLine.value.top;

    lists.value.splice(insertedIdx, 0, [track]);

    let i = insertedIdx;
    if (insertedIdx > removedIdx && trackDragger.i() !== -1 && lists.value[removedIdx].length === 1)
      i--;
    activeIdxs.value = { i, j: 0 };
    removedIdx += +(e.pageY <= trackDragger.lastY());
    // console.log(i, idx, newListLine.value);
  }

  const currentlist = lists.value[trackDragger.i()];
  // insert into exist track list
  if (newListLine.value.i === -1 && draggedIdxs.value.i !== -1) {
    let i = idx;
    if (trackDragger.i() === idx) {
      updateOrder(currentlist, dx - shadowOffset.value, trackDragger.j());
      updateMap(currentlist[0], lists.value);
      removedIdx = -1;
    } else {
      track.marginLeft = -track.width;
      const dstList = lists.value[draggedIdxs.value.i];
      dstList.unshift(track);
      if (overlap) {
        dstList.shift();
      } else {
        updateOrder(dstList, shadowLeft.value + track.width, 0);
        i = idx > trackDragger.i() && currentlist.length === 1 ? idx - 1 : idx;
      }
    }
    activeIdxs.value = { i, j };
  }

  // console.log(removedIdx, trackDragger.j(), +(e.pageY <= trackDragger.lastY()));
  if (trackDragger.i() !== -1 && removedIdx >= 0) {
    deleteTrack(lists.value, removedIdx, trackDragger.j(), false);
    updateMap(track, lists.value);
  }
  draggedIdxs.value.i = -1;
};

const onTrackend = () => {
  if (inVideo() && trackStore._area === ContainerType.Main) {
    deleteTrack(lists.value, trackDragger.i(), trackDragger.j(), false);
  }
  enterCnt = 0;
  newListRequestor.cancel();
  trackStore.setArea(ContainerType.OutSide);
  trackDragger.dragend();
};

const exclude = ref<Element[]>([]);
onMounted(() => {
  if (!exclude.value.length) {
    const headers = document.getElementsByTagName('header') as HTMLCollection;
    const content = document.getElementsByClassName('layout-content')[0] as HTMLElement;
    const splitter = document.getElementsByClassName('splitterH')[0] as HTMLElement;
    exclude.value = [headers[headers.length - 1], content, splitter];
  }
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
