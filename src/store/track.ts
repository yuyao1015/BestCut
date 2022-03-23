import { defineStore } from 'pinia';

import { store } from '@/store';
import { deleteTrack } from '@/logic/tracks/op';
import { TrackManager } from '@/logic/tracks/manager';
import { TrackMap, TrackItem, VideoTrack, isVideo, isAudio } from '@/logic/tracks';

import { ContainerType } from '@/enums/track';
import { getDurationString, durationString2Sec } from '@/utils/player';
import { mainList, audioList, videoList } from '@/../mocks/_track';

const Flag = 2;
const mocks = [
  { video: [], main: [], audio: [] }, // empty
  { video: videoList, main: mainList, audio: audioList }, // full
  // transition
  {
    video: [
      videoList[0],
      videoList[2],
      videoList[4],
      videoList[5],
      videoList[6],
      videoList[8],
      videoList[9],
    ],
    main: [mainList[0], mainList[1]],
    audio: [],
  },
];
const trackMap = mocks[Flag];

type Minfo = { i: number; j: number; type?: keyof TrackMap };
type Tinfo = { step: number; gap: number; unit: number };

interface TrackState {
  _area: ContainerType; // current hovered over container
  trackMap: TrackMap; // data of timeline
  minfo: Minfo; // map
  tinfo: Tinfo; // timeline
  track?: TrackItem; // active track
  offset: number; // for dx of dragger
  hoverVisible: boolean; // timeline hover
  manager: TrackManager;
}

export const useTrackStore = defineStore({
  id: 'app-track',
  state: (): TrackState => ({
    trackMap,
    offset: 0,
    track: undefined,
    hoverVisible: true,
    minfo: { i: -1, j: -1 },
    tinfo: { step: 0, gap: 0, unit: 0 },
    _area: ContainerType.OutSide,
    manager: new TrackManager(trackMap),
  }),
  getters: {
    isResourceOver(): boolean {
      return this._area !== ContainerType.OutSide;
    },
    total(): string {
      return getDurationString(this.manager.duration(), 30);
    },
    current(): string {
      return getDurationString(this.manager.currentTime / 1000, 30);
    },
    videoIdx(): number {
      const { video } = this.trackMap;
      let l = 0,
        r = video.length - 1;
      while (l <= r) {
        const mid = l + Math.floor((r - l) / 2);
        const { type } = video[mid][0];
        if (!isVideo(type)) l = mid + 1;
        else r = mid - 1;
      }
      return l;
    },
  },
  actions: {
    isVideoEmpty(map?: TrackMap): boolean {
      map = map || this.trackMap;
      return !map?.video?.length;
    },
    isAudioEmpty(map?: TrackMap): boolean {
      map = map || this.trackMap;
      return !map?.video?.length;
    },
    isMapEmpty(map?: TrackMap): boolean {
      map = map || this.trackMap;
      return !map.main.length && this.isAudioEmpty(map) && this.isVideoEmpty(map);
    },

    setArea(_area: ContainerType) {
      this._area = _area;
    },
    setTrack(track?: TrackItem, i = -1, j = -1, type?: keyof TrackMap) {
      this.track = track;
      this.minfo = { i, j, type };
    },
    delete() {
      const { i, j, type } = this.minfo;
      if (!this.track || !type) return;
      const inMain = type === 'main';
      let lists = this.trackMap[type];
      lists = (inMain ? [lists] : lists) as TrackItem[][];
      deleteTrack(lists, i, j, inMain);
      this.track = undefined;
      // this.minfo = { i: -1, j: -1 };
    },
    setOffset(offset: number) {
      this.offset = offset;
    },

    setTinfo(info: Tinfo) {
      this.tinfo = info;
    },
    tp2x(tp: number) {
      const { unit, step } = this.tinfo;
      if (unit === 0 || step === 0) return 0;
      return (tp / unit) * step;
    },
    x2tp(x: number) {
      const { unit, step } = this.tinfo;
      if (unit === 0 || step === 0) return 0;
      return (x / step) * unit * 1000;
    },
    calcWidth(track: TrackItem) {
      const { unit, step } = this.tinfo;
      if (unit === 0 || step === 0) return 0;
      let w;

      if (!track.duration) {
        w = track.width ? track.width : 50;
      } else {
        const s = durationString2Sec(track.duration) / unit;
        w = s * step;
      }

      if (track instanceof VideoTrack && track.transition)
        w -= durationString2Sec(track.transition.duration) / unit;

      return w;
    },

    switchHover() {
      this.hoverVisible = !this.hoverVisible;
    },

    updateMap<K extends keyof TrackMap>(lists: TrackMap[K], type?: K) {
      if (!type || !(type in this.trackMap)) return;
      this.trackMap[type] = lists;
    },
    addTrack(track: TrackItem) {
      if (isVideo(track.type)) this.trackMap.main.push(track);
      else if (isAudio(track.type)) this.trackMap.audio.push([track]);
      else this.trackMap.video.splice(this.videoIdx, 0, [track]);
    },

    jumpTo(x: number) {
      this.manager.jumpTo(this.x2tp(x));
    },
    prev(n = 1) {
      this.manager.prevFrame(n);
    },
    next(n = 1) {
      this.manager.nextFrame(n);
    },

    pauseResume() {
      const { manager } = this;
      manager.active ? manager.pauseResume() : manager.play();
    },

    export() {
      const { manager, trackMap } = this;
      manager.updateMap(trackMap);
      manager.export();
    },
  },
});

export function useTrackStoreWithOut() {
  return useTrackStore(store);
}
