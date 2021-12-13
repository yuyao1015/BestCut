import { TrackManager } from '@/logic/track-manager';
import { TrackMap, TrackItem } from '@/logic/track';
import { ResourceType } from '@/enums/resource';

import { defineStore } from 'pinia';

import { store } from '@/store';

import { mainList, audioList, videoList } from '@/../mocks/_track';
import { forEachValue } from '@/utils';
import { getDurationString } from '@/utils/player';

const Debug = 0;
const trackMap = Debug
  ? { video: videoList, main: mainList, audio: audioList }
  : {
      video: [videoList[6]],
      main: [mainList[0]],
      audio: [],
    };

type Calculator = (track: TrackItem | number) => { width: number; marginLeft: number };

interface TrackState {
  isScrolling: boolean;
  isResourceOver: boolean;
  trackMap: TrackMap;
  track?: TrackItem;
  calcWidth?: Calculator;
  manager: TrackManager;
}

export const useTrackStore = defineStore({
  id: 'app-track',
  state: (): TrackState => ({
    isScrolling: false,
    isResourceOver: false,
    trackMap,
    manager: new TrackManager(trackMap),
  }),
  getters: {
    isMapEmpty() {
      let empty = true;
      forEachValue(this.trackMap, (_, v) => {
        if (v.length) empty = false;
      });
      return empty;
    },
    total(): string {
      return getDurationString(this.manager.duration(), 30);
    },
    current(): string {
      return getDurationString(this.manager.currentTime / 1000, 30);
    },
  },
  actions: {
    setScroll(bool: boolean) {
      this.isScrolling = bool;
    },
    setResourceOverState(bool: boolean) {
      this.isResourceOver = bool;
      if (!bool) this.track = undefined;
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
      if (track.type === ResourceType.Video) this.trackMap.main.push(track);
      else if (track.type === ResourceType.Audio) this.trackMap.audio.push([track]);
      else {
        const idx = this.trackMap.video.findIndex((traks) => traks[0].type === ResourceType.Video);
        if (idx === -1) this.trackMap.video.push([track]);
        else this.trackMap.video.splice(idx, 0, [track]);
      }
    },

    pauseResume() {
      const { manager, trackMap } = this;
      manager.updateMap(trackMap);
      manager.active ? manager.pauseResume() : manager.play();
    },
  },
});

export function useTrackStoreWithOut() {
  return useTrackStore(store);
}
