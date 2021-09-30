// import { computed } from 'vue';
import { defineStore } from 'pinia';

import { MP4Player } from '@/logic/mp4';
import { getDurationString } from '@/utils/player';

interface PlayerState {
  player: MP4Player;
}

export const usePlayerStore = defineStore({
  id: 'app-player',
  state: (): PlayerState => ({
    player: new MP4Player({ id: '' }),
  }),
  getters: {
    current(): string {
      const { player } = this;
      return getDurationString(player.refs.current, player.fps);
    },
    total(): string {
      const { player } = this;
      return getDurationString(player.refs.total, player.fps);
    },
    ratio(): string {
      const { refs } = this.player;
      return refs.total ? ((refs.current / refs.total) * 100).toFixed(2) : '0';
    },
    paused(): boolean {
      return this.player.refs.paused;
    },
    playing(): boolean {
      return this.player.configured();
    },
  },
  actions: {
    mount(opts: MP4PlayerOption) {
      this.player = new MP4Player(opts);
    },
    pauseResume() {
      this.player.pauseResume();
    },
    stop() {
      this.player.stop();
    },
    jumpTo(ratio: number) {
      const frames = this.player?.samples?.length;
      frames && this.player.jumpTo(Math.ceil(ratio * frames));
    },
  },
});
