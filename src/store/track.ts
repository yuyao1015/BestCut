import { TrackMap, TrackItem, VideoTrack, AudioTrack } from '@/logic/track';

import { defineStore } from 'pinia';

import { store } from '@/store';

import { mainList, audioList, videoList } from '@/../mocks/_track';

const Debug = 0;
const trackMap = Debug
  ? { video: videoList, main: mainList, audio: audioList }
  : {
      video: [],
      main: [],
      audio: [],
    };

type Calculator = (track: TrackItem) => { width: number; marginLeft: number };
interface TrackState {
  isScrolling: boolean;
  isResourceOver: boolean;
  trackMap: TrackMap;
  track?: TrackItem;
  calcWidth?: Calculator;
}

export const useTrackStore = defineStore({
  id: 'app-track',
  state: (): TrackState => ({
    isScrolling: false,
    isResourceOver: false,
    trackMap,
  }),
  getters: {},
  actions: {
    setScroll(bool: boolean) {
      this.isScrolling = bool;
    },
    setResourceOverState(bool: boolean) {
      this.isResourceOver = bool;
    },
    setTrack(track: TrackItem) {
      this.track = track;
    },
    setCalculator(calc: Calculator) {
      this.calcWidth = calc;
    },

    updateMap<K extends keyof TrackMap>(lists: TrackMap[K], type?: K) {
      if (!type || !(type in this.trackMap)) return;
      this.trackMap[type] = lists;
    },
    addTrack(track: TrackItem) {
      if (track instanceof VideoTrack) this.trackMap.main.push(track);
      else if (track instanceof AudioTrack) this.trackMap.audio.push([track]);
      else {
        const idx = this.trackMap.video.findIndex((traks) => traks[0] instanceof VideoTrack);
        if (idx === -1) this.trackMap.video.push([track]);
        else this.trackMap.video.splice(idx, 0, [track]);
      }
    },
  },
});

export function useTrackStoreWithOut() {
  return useTrackStore(store);
}
