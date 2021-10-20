import { defineStore } from 'pinia';

import { store } from '@/store';

interface TrackState {
  isScrolling: boolean;
}

export const useTrackStore = defineStore({
  id: 'app-track',
  state: (): TrackState => ({
    isScrolling: false,
  }),
  getters: {},
  actions: {
    setScroll(bool: boolean) {
      this.isScrolling = bool;
    },
  },
});

export function usePlayerStoreWithOut() {
  return useTrackStore(store);
}
