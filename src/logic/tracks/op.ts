import { ResourceType } from '@/enums/resource';
import { TrackItem } from '@/logic/tracks';
import { swap } from '@/utils';

export const offset = 20;

/* 
  row
*/
export const searchMainIdx = (list: TrackItem[], dx: number, idx: number) => {
  if (dx > 0) {
    while (list[idx + 1] && dx > offset) {
      dx -= list[idx + 1].width;
      dx = dx > 0 ? dx : 0;
      idx++;
    }
  }
  if (dx < 0) {
    while (list[idx - 1] && dx < -list[idx - 1].width / 2) {
      dx += list[idx - 1].width;
      dx = dx < 0 ? dx : 0;
      idx--;
    }
  }
  return { idx, dx };
};

export const updateMainOrder = (list: TrackItem[], dx: number, j: number, track?: TrackItem) => {
  const { idx, dx: _dx } = searchMainIdx(list, dx, j);

  for (const trak of list) {
    trak.marginRight = 0;
    trak.marginLeft = 0;
  }

  if (track) {
    track.marginLeft = track.marginRight = 0;
    const _idx = _dx >= offset ? idx + 1 : idx;
    list.splice(_idx, 0, track);
    return;
  }

  if (idx === j) return;

  const sign = dx > 0 ? 1 : 0;
  list.splice(idx + sign, 0, list[j]);
  list.splice(j + 1 - sign, 1);
  0 && swap<TrackItem>(list, idx, j);
};

// non initial trak's marginLeft > 0
export const searchRowIdx = (list: TrackItem[], dx: number, idx: number) => {
  let overlap = false;
  const { width } = list[idx];
  if (dx > 0) {
    while (list[idx + 1] && dx >= list[idx + 1].marginLeft + list[idx + 1].width + width) {
      dx -= list[idx + 1].marginLeft + list[idx + 1].width;
      dx = dx > 0 ? dx : 0;
      idx++;
    }
    if (list[idx + 1] && dx > list[idx + 1].marginLeft) overlap = true;
  }
  if (dx < 0) {
    while (list[idx - 1] && dx <= -list[idx - 1].width - list[idx].marginLeft - width) {
      dx += list[idx - 1].width + list[idx].marginLeft;
      dx = dx < 0 ? dx : 0;
      idx--;
    }
    if (dx < -list[idx].marginLeft) overlap = true;
  }

  return { idx, overlap, clippedDx: dx };
};

export const updateOrder = (list: TrackItem[], dx: number, j: number) => {
  const { idx, overlap, clippedDx } = searchRowIdx(list, dx, j);
  if (overlap) return { idx, overlap };

  // no swap
  if (idx === j) {
    list[j].marginLeft += clippedDx;
    if (list[j + 1]) list[j + 1].marginLeft -= clippedDx;
  } else {
    if (list[j + 1]) list[j + 1].marginLeft += list[j].width + list[j].marginLeft;

    if (dx > 0) {
      list[j].marginLeft = clippedDx - list[j].width;
      if (list[idx + 1]) list[idx + 1].marginLeft -= clippedDx;
    }
    if (dx < 0) {
      list[j].marginLeft = list[idx].marginLeft + clippedDx;
      list[idx].marginLeft -= list[j].marginLeft + list[j].width;
    }
    const sign = dx > 0 ? 1 : 0;
    list.splice(idx + sign, 0, list[j]);
    list.splice(j + 1 - sign, 1);
  }
  return { idx, overlap };
};

/* 
  col
*/
export const searchColIdx = (
  lists: TrackItem[][],
  dy: number,
  my: number,
  idx: number,
  type?: ResourceType
) => {
  let _dy = dy > 0 ? dy : -dy;

  const sign = dy > 0 ? 1 : -1;
  const ratio = type ? 1 : 2 / 3;
  type = type || lists[idx][0].type;

  while (lists[idx + sign] && lists[idx] && _dy - (sign * my) / 2 > lists[idx][0].height * ratio) {
    _dy -= lists[idx][0].height + sign * my;
    _dy = _dy > 0 ? _dy : 0;
    idx += sign;
  }

  // active track type different with current list or hovering over margin area
  let newListVisible = false;
  // hovering over current list and paused 500ms
  let canRequestNewList = true;

  if (
    (lists[idx] && type !== lists[idx][0].type) ||
    dy < 0 ||
    (lists[idx] && _dy > (lists[idx][0].height * 2) / 3) ||
    (idx === lists.length - 1 && _dy > (lists[lists.length - 1][0].height * 2) / 3)
  )
    newListVisible = true;

  if (lists[idx]) canRequestNewList = dy > 0 && _dy > (lists[idx][0].height * 2) / 3;

  return {
    idx,
    newListVisible,
    canRequestNewList,
    dy: _dy,
  };
};

export const deleteTrack = (lists: TrackItem[][], i: number, j: number, inMain: boolean) => {
  const list = lists[i];
  if (!inMain && list[j + 1]) list[j + 1].marginLeft += list[j].marginLeft + list[j].width;
  list.splice(j, 1);
  if (!inMain && !list.length) lists.splice(i, 1);
};
