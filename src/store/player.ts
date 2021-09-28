import { computed } from 'vue';
import { MP4Demuxer } from './../logic/mp4/demuxer';
import { defineStore } from 'pinia';

import { MP4Player } from '@/logic/mp4';

interface PlayerState {
  player: MP4Player;
  playing: boolean;
  // currentTime: string;
  // duration: string;
}

const DURATION = '00:00:00:00';

export const usePlayerStore = defineStore({
  id: 'app-player',
  state: (): PlayerState => ({
    player: new MP4Player(''),
    playing: false,
    // currentTime: DURATION,
    // duration: DURATION,
  }),
  getters: {
    demuxer(): MP4Demuxer | null {
      return this.player.demuxer;
    },
    currentTime(): string {
      const time = computed(() => this.player.currentTime);
      return time.value && this.playing ? time.value : DURATION;
    },
    duration(): string {
      return this.demuxer && this.demuxer.total && this.playing ? this.demuxer?.total : DURATION;
    },
  },
  actions: {
    init(uri: string) {
      if (uri) this.player = new MP4Player(uri) as any;
    },
    stop() {
      this.playing = false;
      const { ctx, decoder } = this.player;
      if (!ctx) return;
      ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      decoder.close();
      // this.currentTime = DURATION;
      // this.duration = DURATION;
    },
    pauseResume() {
      this.playing = !this.playing;
      this.player.pauseResume();
    },
  },
});
