// import { computed } from 'vue';
import { defineStore } from 'pinia';

import { MP4Player } from '@/logic/mp4';

interface PlayerState {
  player: MP4Player | null;
}

const DURATION = '00:00:00:00';

export const usePlayerStore = defineStore({
  id: 'app-player',
  state: (): PlayerState => ({
    player: null,
  }),
  getters: {
    current(): string {
      return this.player?.refs.current ? this.player?.refs.current : DURATION;
    },
    total(): string {
      return this.player?.refs.total ? this.player?.refs.total : DURATION;
    },
    paused(): boolean {
      return this.player ? this.player.refs.paused : true;
    },
  },
  actions: {
    mount(opts: MP4PlayerOption) {
      this.player = new MP4Player(opts);
    },
    pauseResume() {
      this.player && this.player.pauseResume();
    },
    stop() {
      this.player && this.player.stop();
    },
  },
});
