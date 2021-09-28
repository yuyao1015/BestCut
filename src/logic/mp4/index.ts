import { ref } from 'vue';

import { MP4Demuxer } from '@/logic/mp4/demuxer';
import { getDurationString } from '@/utils/player';

export class MP4Player {
  frameRate = 1 / 30;
  frameCount = 0;
  currentTime = ref('');
  uri: string;
  ctx: CanvasRenderingContext2D | null = null;
  demuxer: MP4Demuxer | null = null;
  decoder: any;

  constructor(uri: string) {
    this.demuxer = new MP4Demuxer(uri);
    this.uri = uri;
    this.initPlayer();
  }

  initPlayer() {
    const { demuxer, currentTime } = this;
    if (!demuxer) return;

    const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
    if (canvas) this.ctx = canvas.getContext('2d');
    const onFrame = async (frame: any) => {
      if (!this.ctx) return;
      const { ctx } = this;
      this.frameCount++;
      currentTime.value = getDurationString(this.frameCount * this.frameRate, 30);
      ctx.drawImage(frame, 0, 0, ctx.canvas.width, ctx.canvas.height);
      frame.close();
    };

    this.decoder = new window.VideoDecoder({
      output: onFrame,
      error: (e: any) => console.error(e),
    });
    demuxer.getConfig().then((config) => {
      // ctx.canvas.height = config.codedHeight;
      // ctx.canvas.width = config.codedWidth;

      this.decoder.configure(config);
      demuxer.start((chunk: any) => {
        this.decoder.decode(chunk);
      });
    });
  }

  pauseResume() {
    this.demuxer && this.demuxer.source.pauseResume();
  }
}
