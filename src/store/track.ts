import { defineStore } from 'pinia';

import { store } from '@/store';
import { TrackManager } from '@/logic/tracks/manager';
import { TrackMap, TrackItem, isVideo, isAudio } from '@/logic/tracks';

import { ContainerType } from '@/enums/track';
import { getDurationString } from '@/utils/player';
import { mainList, audioList, videoList } from '@/../mocks/_track';

const Debug = 0;
const trackMap = Debug
  ? { video: videoList, main: mainList, audio: audioList }
  : {
      video: [
        videoList[0],
        videoList[2],
        videoList[3],
        videoList[5],
        videoList[6],
        videoList[8],
        videoList[9],
      ],
      main: [
        //
        mainList[0],
        mainList[1],
      ],
      audio: [],
      // audio: audioList,
    };

type Calculator = (track: TrackItem | number) => { width: number; marginLeft: number };

interface TrackState {
  _area: ContainerType; // current hovered over container
  trackMap: TrackMap;
  track?: TrackItem;
  offset: number;
  calcWidth?: Calculator;
  manager: TrackManager;
}

export const useTrackStore = defineStore({
  id: 'app-track',
  state: (): TrackState => ({
    trackMap,
    offset: 0,
    _area: ContainerType.OutSide,
    manager: new TrackManager(trackMap),
  }),
  getters: {
    isVideoEmpty(): boolean {
      return !this.trackMap.video.length;
    },
    isAudioEmpty(): boolean {
      return !this.trackMap.audio.length;
    },
    isMapEmpty(): boolean {
      return !this.trackMap.main.length && this.isAudioEmpty && this.isVideoEmpty;
    },
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
    setArea(_area: ContainerType) {
      this._area = _area;
    },
    setTrack(track: TrackItem) {
      this.track = track;
    },
    setOffset(offset: number) {
      this.offset = offset;
    },
    setCalculator(calc: Calculator) {
      this.calcWidth = calc;
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
