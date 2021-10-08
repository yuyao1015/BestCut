import { defineStore } from 'pinia';

import { store } from '@/store';
import { MP4Player } from '@/logic/mp4';
import { getDurationString, clipDuration } from '@/utils/player';

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
      return this.player.active;
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
    prev(n = 1) {
      this.player.prevFrame(n);
    },
    next(n = 1) {
      this.player.nextFrame(n);
    },
    parseInfo(url: string): Promise<{ cover: string; duration: string }> {
      this.mount({ id: '', url });

      return new Promise((resolve) => {
        let cover = '',
          duration = '';
        this.player.onPlayStart = function () {
          const { samples } = this;
          for (let i = 0; i < samples.length; i++) {
            samples[i].data; // TODO: skip leading black frame

            this.chunkStart = i;
            const chunk = this.getChunk(samples[i]);
            this.decoder.decode(chunk);

            this.onPlaying = function () {
              if (i === this.chunkStart - 1) {
                cover = this.canvas.toDataURL();
                resolve({ cover, duration });
              }
            };
            break;
          }
          duration = clipDuration(getDurationString(this.refs.total, this.fps));
        };
      });
    },
  },
});

export function usePlayerStoreWithOut() {
  return usePlayerStore(store);
}
