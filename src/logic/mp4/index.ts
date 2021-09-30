import { reactive } from 'vue';

import { getExtraData } from '@/utils/player';

class MP4Source {
  file: any;
  info: any;
  info_resolver: any;
  videoTrack: any;
  audioTrack: any;

  constructor(url: string) {
    this.file = window.MP4Box.createFile();
    this.file.onError = console.error.bind(console);
    this.file.onReady = this.onReady.bind(this);
    this.file.onSamples = this.onSamples.bind(this);
    this.info = null;
    this.info_resolver = null;

    fetch(url).then((response: Response) => {
      if (!response.body) return;
      const reader = response.body.getReader();
      let offset = 0;
      const mp4File = this.file;

      function appendBuffers({ done, value }: any) {
        if (done) {
          mp4File.flush();
          return;
        }
        const buf = value.buffer;
        buf.fileStart = offset;
        offset += buf.byteLength;

        mp4File.appendBuffer(buf);
        reader.read().then(appendBuffers);
      }
      reader.read().then(appendBuffers);
    });
  }

  onReady(info: any) {
    // TODO: Generate configuration changes.
    this.info = info;
    if (this.info_resolver) {
      this.info_resolver(info);
      this.info_resolver = null;
    }
  }

  getInfo() {
    if (this.info) return Promise.resolve(this.info);
    return new Promise((resolver) => {
      this.info_resolver = resolver;
    });
  }

  getAvccBox() {
    // TODO: make sure this is coming from the right track.
    return this.file.moov.traks[0].mdia.minf.stbl.stsd.entries[0].avcC;
  }

  onSamples(track_id: string, ref: any, samples: any[]) {
    track_id;
    ref;
    samples;
  }

  async getConfig() {
    const info = await this.getInfo();
    this.videoTrack = info.videoTracks[0];
    this.audioTrack = info.audioTracks[0];
    const extraData = getExtraData(this.getAvccBox());
    const config = {
      videoCfg: {
        codec: this.videoTrack.codec,
        codedHeight: this.videoTrack.track_height,
        codedWidth: this.videoTrack.track_width,
        description: extraData,
      },
    };
    return Promise.resolve(config);
  }

  start(type: string) {
    const id = type === 'video' ? this.videoTrack.id : this.audioTrack.id;
    this.file.setExtractionOptions(id);
    this.file.start();
  }
  getSamples(type: string) {
    const id = type === 'video' ? this.videoTrack.id : this.audioTrack.id;
    return this.file.getTrackSamplesInfo(id);
  }
}

export class MP4Player {
  id: string;
  canvas: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D | null;
  url?: string;

  fps = 30;
  currentTime = 0;
  lastTime = 0;
  interval = 100 / 3;
  paint = true;
  rAF: number | null = null;

  decoder: VideoDecoder;
  source?: MP4Source;

  samples: any;
  chunkStart = 0;
  chunkSize = 0;

  refs = reactive({ current: 0, total: 0, paused: false });

  constructor(opts: MP4PlayerOption) {
    if (opts.id) {
      this.id = opts.id;
      this.canvas = document.getElementById(opts.id) as HTMLCanvasElement;
    } else if (opts.canvas) {
      this.canvas = opts.canvas;
      this.id = opts.canvas.id;
    } else {
      this.canvas = document.createElement('canvas');
      this.id = '';
    }
    this.ctx = this.canvas.getContext('2d');

    this.url = opts.url;
    opts.url && this.setSource(opts.url);
  }

  setSource(url: string) {
    this.decoder = new window.VideoDecoder({
      output: this.onFrame(),
      error: (e: any) => console.error(e),
    });

    this.source = new MP4Source(url);
    this.source.getConfig().then((config: any) => {
      const { videoCfg } = config;
      // this.canvas.height = videoCfg.codedHeight;
      // this.canvas.width = videoCfg.codedWidth;
      this.decoder.configure(videoCfg);

      this.samples = this.source?.getSamples('video');
      if (!this.samples?.length) return;
      this.chunkSize = this.samples?.length;
      const sample = this.samples[0];
      this.fps = sample.timescale / (sample.cts - sample.dts);
      this.interval = 1000 / this.fps;
      this.source?.start('video');

      this.lastTime = performance.now();
      this.display();
      this.onPlayStart();
    });
  }

  onPlayStart() {
    const { movie_duration, movie_timescale } = this.source?.videoTrack;
    this.refs.total = movie_duration / movie_timescale;
    if (this.refs.paused) this.pause();
  }

  onPlayEnd() {
    if (this.configured()) this.decoder.flush();
    console.log('play end');
  }

  onFrame() {
    let frameCount = this.chunkStart;
    let startTime = 0;
    return (frame: VideoFrame) => {
      const now = performance.now();
      if (this.ctx && this.paint)
        this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
      frame.close();

      let fpsAvg = '';
      if (frameCount++) {
        const elapsed = now - startTime;
        fpsAvg = ' (' + ((1000.0 * frameCount) / elapsed).toFixed(0) + ' fps)';
      } else startTime = now;
      let div = document.getElementById('123ƒ');
      if (!div) {
        div = document.createElement('div');
        div.id = '123ƒ';
        div.style.position = 'fixed';
        div.style.bottom = '0';
        div.style.right = '0';
        div.style.color = 'white';
        document.body.appendChild(div);
      }
      div.innerHTML = fpsAvg;
    };
  }

  jumpTo(idx: number) {
    const {
      refs: { paused },
      samples,
    } = this;

    if (!samples?.length) return;
    if (this.configured() && !paused) this.pause();
    let i = idx;
    this.paint = false;
    while (!samples[i].is_sync) i--;
    while (i < idx) {
      const sample = samples[i++];
      const chunk = this.getChunk(sample);
      this.decoder.decode(chunk);
    }
    this.paint = true;
    this.chunkStart = idx;
    this.refs.current = (idx - 1) / this.fps;
    if (!paused) this.resume();
  }

  display() {
    this.currentTime = performance.now();
    const elapsed = this.currentTime - this.lastTime;
    if (elapsed > this.interval && this.samples && this.samples.length) {
      const sample = this.samples[this.chunkStart];
      if (!sample) return;

      this.refs.current = this.chunkStart / this.fps;

      const chunk = this.getChunk(sample);
      this.configured() && this.decoder.decode(chunk);
      this.updateLastTime();
      this.chunkStart++;
    }

    if (this.chunkSize && this.chunkStart === this.chunkSize) {
      this.onPlayEnd();
    }

    this.rAF = requestAnimationFrame(() => this.display());
  }

  updateLastTime() {
    const elapsed = this.currentTime - this.lastTime;
    this.lastTime = this.currentTime - (elapsed % this.interval);
  }

  pauseResume() {
    if (this.closed()) return;
    if (this.refs.paused) this.resume();
    else this.pause();
  }

  pause() {
    this.rAF && cancelAnimationFrame(this.rAF);
    this.refs.paused = true;
  }

  resume() {
    if (!this.currentTime) this.lastTime = performance.now();
    this.updateLastTime();
    this.rAF = requestAnimationFrame(() => this.display());
    this.refs.paused = false;
  }

  stop() {
    const { ctx, canvas } = this;
    ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.pause();
    if (this.configured()) this.decoder.close();

    this.refs.current = 0;
    this.refs.total = 0;
    this.refs.paused = true;
  }
  closed() {
    return this.decoder && this.decoder.state === 'closed';
  }
  configured() {
    return this.decoder && this.decoder.state === 'configured';
  }
  getChunk(sample: any) {
    const options = {
      type: sample.is_sync ? 'key' : 'delta',
      timestamp: sample.cts,
      duration: sample.duration,
      data: sample.data,
    };
    return new window.EncodedVideoChunk(options);
  }
}
