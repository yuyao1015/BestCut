import { TrackItem } from '@/logic/track';
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
  for (const trak of list) {
    trak.marginRight = 0;
    trak.marginLeft = 0;
  }

  const { idx, dx: _dx } = searchMainIdx(list, dx, j);

  if (track) {
    if (_dx >= offset) list.splice(idx + 1, 0, track);
    else list.splice(idx, 0, track);
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
// TODO: attachment track create new list boundary

export const searchColIdx = (lists: TrackItem[][], dy: number, my: number, idx: number) => {
  let _dy = dy > 0 ? dy : -dy;
  let newListVisiable = false;

  const sign = dy > 0 ? 1 : -1;
  while (lists[idx + sign] && lists[idx + sign].length && _dy > (lists[idx][0].height * 2) / 3) {
    const cur = lists[idx][0];
    const next = lists[idx + sign][0];

    if (cur.type !== next.type) {
      newListVisiable = true;
      break;
    }

    _dy -= cur.height + my;
    _dy = _dy > 0 ? _dy : 0;
    idx += sign;
    newListVisiable = false;
  }
  if (
    (idx === 0 && _dy > (lists[0][0].height * 2) / 3) ||
    (idx === lists.length - 1 && _dy > (lists[lists.length - 1][0].height * 2) / 3)
  )
    newListVisiable = true;

  const canRequestNewList = _dy > lists[idx][0].height / 3;

  return { idx, newListVisiable, canRequestNewList };
};

export const deleteTrack = (lists: TrackItem[][], i: number, j: number, isMain: boolean) => {
  const list = lists[i];
  if (!isMain && list[j + 1]) list[j + 1].marginLeft += list[j].marginLeft + list[j].width;
  list.splice(j, 1);
  if (!isMain && !list.length) lists.splice(i, 1);
};
