import type { Attachment } from './../track-manager';
import type { TextTrack, StickerTrack } from './../track';

import type { MP4PlayerOption } from '#/player';
import type { DowndloadCallback } from './downloader';

import { reactive } from 'vue';

import { getExtraData } from '@/utils/player';
import { Downloader } from './downloader';
import { isString } from '@/utils/is';

import { Renderer } from '../renderer';
import { ResourceType } from '@/enums/resource';

export class MP4Source {
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

  onSamples(track_id: string, ref: any, samples: any[]) {}

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

  start(id: string | number) {
    this.file.setExtractionOptions(id);
    this.file.start();
  }
  getSamples(id: string | number) {
    return this.file.getTrackSamplesInfo(id);
  }
}

const _canvas = document.createElement('canvas');
const _ctx = _canvas.getContext('2d');

export class MP4Player {
  id: string;
  canvas: HTMLCanvasElement;
  url?: string;
  paused: boolean; // flag for resume/pause

  // video
  fps = 30;
  currentTime = 0;
  lastTime = 0;
  interval = 100 / 3;
  canPaint = true;
  active = false; // whether video normally decoded
  rAF: number | null = null;

  attachments: Attachment[] = [];

  // config
  ratio = 0;
  rawRatio = 0;

  decoder: VideoDecoder;
  encoder: VideoEncoder;
  source?: MP4Source;

  samples: any;
  chunkStart = 0;
  chunkSize = 0;

  refs = reactive({ current: 0, total: 0 });

  renderer?: Renderer;

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

    this.url = opts.url;
    this.paused = opts.paused || false;
    opts.url && this.demux(opts.url);
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    _canvas.width = canvas.width;
    _canvas.height = canvas.height;
    this.renderer = new Renderer(canvas);
  }

  updateSize() {
    _canvas.width = this.canvas.width;
    _canvas.height = this.canvas.height;
    this.renderer?.setSize(this.canvas.width, this.canvas.height);
  }

  demux(source: string | MP4Source) {
    this.chunkStart = 0;

    _canvas.width = this.canvas.width;
    _canvas.height = this.canvas.height;
    this.renderer = new Renderer(this.canvas);

    this.decoder = new window.VideoDecoder({
      output: this.onFrame(),
      error: (e: any) => console.error(e),
    });

    this.source = isString(source) ? new MP4Source(source) : source;
    this.source.getConfig().then((config: any) => {
      const { videoCfg } = config;

      this.decoder.configure(videoCfg);

      const { codedHeight: h, codedWidth: w } = videoCfg;
      this.rawRatio = w / h;
      if (!this.id) {
        this.canvas.height = h;
        this.canvas.width = w;
      }

      this.samples = this.source?.getSamples(this.source.videoTrack.id);
      if (!this.samples?.length) return;

      this.chunkSize = this.samples?.length;
      // const sample = this.samples[0];
      // this.fps = sample.timescale / (sample.cts - sample.dts);
      this.interval = 1000 / this.fps;
      this.source?.start(this.source.videoTrack.id);

      this.lastTime = performance.now();
      const { movie_duration, movie_timescale } = this.source?.videoTrack;
      this.refs.total = movie_duration / movie_timescale;

      this.display();
      if (this.paused) this.pause();
      else this.onPlayStart();
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

      if (this.canPaint) {
        _ctx?.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);

        for (const { track, startFrame, endFrame } of this.attachments) {
          if (
            !_ctx ||
            ![ResourceType.Sticker, ResourceType.Text].includes(track.type) ||
            frameCount < startFrame ||
            frameCount > endFrame
          )
            continue;
          if (track.type === ResourceType.Text) this.drawText(_ctx, track as TextTrack);
          if (track.type === ResourceType.Sticker)
            this.drawSticker(_ctx, track as StickerTrack, frameCount, startFrame, endFrame);
        }

        this.renderer?.draw(_canvas, this.attachments, frameCount);
      }

      frame.close();

      if (this.encoder) {
        this.encoder.encode(frame);
      } else {
        this.onPlaying();
      }

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

  drawText(ctx: CanvasRenderingContext2D, track: TextTrack) {
    const { name, x, y, size, fontFamily } = track;
    ctx!.font = `${size}px ${fontFamily}`;
    ctx!.fillStyle = '#fff';
    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'middle';
    ctx!.fillText(name, this.canvas.width * x, this.canvas.height * y);
    ctx?.stroke();
  }
  drawSticker(
    ctx: CanvasRenderingContext2D,
    track: StickerTrack,
    idx: number,
    s: number,
    e: number
  ) {
    const { x, y, r } = track;
    const { frames } = track;
    if (frames.length) {
      const i = (idx - s) % frames.length;
      const c = track.getImageData(_canvas, i);
      const w = this.canvas.width * r;
      const h = (w * c.height) / c.width;
      ctx.drawImage(c, this.canvas.width * x - w / 2, this.canvas.height * y - h / 2, w, h);
    }
  }

  jumpTo(idx: number) {
    const { paused, samples } = this;

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
    const { paused, samples } = this;

    if (!paused) return;

    this.chunkStart = Math.max(this.chunkStart - n, 0);
    const sample = samples[this.chunkStart];
    this.refs.current = this.chunkStart / this.fps;
    const chunk = this.getChunk(sample);
    this.decoder.decode(chunk);
  }

  // TODO: first call current duration 2 frame ++
  nextFrame(n: number) {
    const { paused, samples } = this;

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
    if (this.paused) this.resume();
    else this.pause();
  }

  pause() {
    this.rAF && cancelAnimationFrame(this.rAF);
    this.paused = true;
  }

  resume() {
    if (!this.currentTime) this.lastTime = performance.now();
    this.updateLastTime();
    this.rAF = requestAnimationFrame(() => this.display());
    this.paused = false;
  }

  stop() {
    this.renderer?.clear();
    this.pause();
    if (this.configured()) this.decoder.close();

    this.refs.current = 0;
    this.refs.total = 0;
    this.paused = true;
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
    const width = 1920,
      height = 1080,
      n = 1000;
    const file = new window.MP4Box.createFile();
    const track = file.addTrack({
      timescale: 1000000,
      width,
      height,
      nb_samples: 2000,
    });
    this.encoder = new window.VideoEncoder({
      output: this.onChunk(file, track, n),
      error: (e: any) => console.error(e),
    });

    this.encoder.configure({
      codec: 'avc1.42001E',
      width,
      height,
      hardwareAcceleration: 'prefer-hardware',
      // framerate: Math.ceil(1000 / (videoDuration / n)),
      avc: { format: 'avc' },
    });
  }
}
