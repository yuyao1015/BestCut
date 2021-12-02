import type { MP4PlayerOption } from '#/player';
import type { DowndloadCallback } from './downloader';

import { reactive } from 'vue';

import { getExtraData } from '@/utils/player';
import { Downloader } from './downloader';

class MP4Source {
  file: any;
  info: any;
  info_resolver: any;
  videoTrack: any;
  audioTrack: any;
  downloader: Downloader;

  constructor(url: string) {
    this.file = window.MP4Box.createFile();
    this.file.onError = console.error.bind(console);
    this.file.onReady = this.onReady.bind(this);
    this.file.onSamples = this.onSamples.bind(this);
    this.info = null;
    this.info_resolver = null;

    this.downloader = new Downloader(url);
    this.download();
  }

  download() {
    const downloadCallback: DowndloadCallback = (buffer, end) => {
      let nextStart = 0;
      nextStart = this.file.appendBuffer(buffer, end);
      if (end) {
        this.file.flush();
      } else {
        this.downloader.setChunkStart(nextStart);
      }
    };
    this.downloader.setCallback(downloadCallback);
    this.downloader.start();
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
        videoDuration: (info.duration / info.timescale) * 1000,
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

  // video
  fps = 30;
  currentTime = 0;
  lastTime = 0;
  interval = 100 / 3;
  canPaint = true;
  active = false;
  rAF: number | null = null;

  // config
  ratio = 0;
  rawRatio = 0;

  decoder: VideoDecoder;
  encoder: VideoEncoder;
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
    opts.url && this.demux(opts.url);
  }

  demux(url: string) {
    this.decoder = new window.VideoDecoder({
      output: this.onFrame(),
      error: (e: any) => console.error(e),
    });

    this.source = new MP4Source(url);
    this.source.getConfig().then((config: any) => {
      const { videoCfg } = config;

      this.decoder.configure(videoCfg);

      const { codedHeight: h, codedWidth: w } = videoCfg;
      this.rawRatio = w / h;
      if (!this.id) {
        this.canvas.height = h;
        this.canvas.width = w;
      }

      this.samples = this.source?.getSamples('video');
      if (!this.samples?.length) return;
      this.chunkSize = this.samples?.length;
      const sample = this.samples[0];
      this.fps = sample.timescale / (sample.cts - sample.dts);
      this.interval = 1000 / this.fps;
      this.source?.start('video');

      this.lastTime = performance.now();
      const { movie_duration, movie_timescale } = this.source?.videoTrack;
      this.refs.total = movie_duration / movie_timescale;
      if (this.refs.paused) this.pause();

      this.onPlayStart();
      this.display();
    });
  }

  onPlayStart() {
    console.log('play start');
  }
  onPlaying() {
    console.log('playing');
  }
  onPlayEnd() {
    console.log('play end');
  }

  onFrame() {
    let frameCount = this.chunkStart;
    let startTime = 0;
    return (frame: VideoFrame) => {
      if (!this.active) this.active = true;
      const now = performance.now();

      if (this.ctx && this.canPaint)
        this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
      frame.close();
      this.onPlaying();

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
        // div.style.display = 'none';
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
    this.canPaint = false;
    while (!samples[i].is_sync) i--;
    while (i < idx) {
      const sample = samples[i++];
      const chunk = this.getChunk(sample);
      this.decoder.decode(chunk);
    }
    this.canPaint = true;
    this.chunkStart = idx;
    this.refs.current = (idx - 1) / this.fps;
    if (!paused) this.resume();
  }

  prevFrame(n: number) {
    const {
      refs: { paused },
      samples,
    } = this;

    if (!paused) return;

    this.chunkStart = Math.max(this.chunkStart - n, 0);
    const sample = samples[this.chunkStart];
    this.refs.current = this.chunkStart / this.fps;
    const chunk = this.getChunk(sample);
    this.decoder.decode(chunk);
  }

  // TODO: first call current duration 2 frame ++
  nextFrame(n: number) {
    const {
      refs: { paused },
      samples,
    } = this;

    if (!paused) return;
    this.chunkStart = Math.min(this.chunkStart + n, samples.length);
    const sample = samples[this.chunkStart];
    this.refs.current = this.chunkStart / this.fps;
    const chunk = this.getChunk(sample);
    this.decoder.decode(chunk);
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
      if (this.configured()) this.decoder.flush();
      this.active = false;
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
    this.active = false;
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

  onChunk(file: any, track: any, totalFrames: number) {
    let chunkCount = 0;
    let startTime = 0;
    return (chunk: any /* config: any */) => {
      const ab = new ArrayBuffer(chunk.byteLength);
      chunk.copyTo(ab);
      //
      const sampleOptions = {
        dts: chunk.timestamp * 1000,
        cts: chunk.timestamp * 1000,
        is_sync: chunk.type === 'key',
      };

      const now = performance.now();
      let fpsAvg = '';
      if (chunkCount++) {
        const elapsed = now - startTime;
        fpsAvg = ' (' + ((1000.0 * chunkCount) / elapsed).toFixed(0) + ' fps)';
        file.addSample(track, ab, sampleOptions);
      } else startTime = now;

      let div = document.getElementById('encoder');
      if (!div) {
        div = document.createElement('div');
        div.id = 'encoder';
        div.style.position = 'fixed';
        // div.style.display = 'none';
        div.style.bottom = '0';
        div.style.left = '0';
        div.style.color = 'white';
        document.body.appendChild(div);
      }
      div.innerHTML = fpsAvg;

      console.log(chunkCount, totalFrames);
      if (chunkCount === totalFrames - 2) {
        this.encoder.close();
        file.save('test.mp4');
        console.log('completed !');
      }
    };
  }

  remux() {
    if (!this.url) return;
    const decoder = new window.VideoDecoder({
      output: (frame: VideoFrame) => {
        if (this.encoder) this.encoder.encode(frame);
        frame.close();
      },
      error: (e: any) => console.error(e),
    });

    const source = new MP4Source(this.url);
    source.getConfig().then((config: any) => {
      const { videoCfg } = config;
      decoder.configure(videoCfg);
      const { codedHeight: height, codedWidth: width, codec, videoDuration } = videoCfg;

      const samples = source?.getSamples('video');
      if (!samples?.length) return;
      source?.start('video');

      const file = new window.MP4Box.createFile();
      const track = file.addTrack({
        timescale: 1000000,
        // timescale: samples[0].timescale,
        width,
        height,
        nb_samples: samples.length,
      });

      this.encoder = new window.VideoEncoder({
        output: this.onChunk(file, track, samples.length),
        error: (e: any) => console.error(e),
      });

      this.encoder.configure({
        // codec: 'avc1.42001E',
        codec,
        width,
        height,
        hardwareAcceleration: 'prefer-hardware',
        framerate: Math.ceil(1000 / (videoDuration / samples.length)),
        avc: { format: 'avc' },
      });

      for (const sample of samples) {
        const chunk = this.getChunk(sample);
        decoder.decode(chunk);
      }
    });
  }
}
