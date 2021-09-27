import { noop } from '@/utils/index';
import { getDurationString } from '@/utils/player';

export class MP4Source {
  file: any;
  info: any;
  info_resolver: any;
  chunks: any[] = [];
  onChunk: (chunk: any) => void = noop;

  fps = 0;
  interval = 0;
  timescale = 1000;
  currtenTime = 0;
  lastTime = 0;
  paused = true;
  rAF: any;

  constructor(uri: string) {
    this.file = window.MP4Box.createFile();
    this.file.onError = console.error.bind(console);
    this.file.onReady = this.onReady.bind(this);
    this.file.onSamples = this.onSamples.bind(this);

    fetch(uri).then((response: any) => {
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

    this.info = null;
    this.info_resolver = null;
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

  display() {
    this.currtenTime = performance.now();
    const elapsed = this.currtenTime - this.lastTime;
    if (elapsed > this.interval && this.chunks.length && this.onChunk) {
      this.onChunk(this.chunks[0]);
      this.chunks.shift();
      this.updateLastTime();
    }

    this.rAF = requestAnimationFrame(() => this.display());
  }

  updateLastTime() {
    const elapsed = this.currtenTime - this.lastTime;
    this.lastTime = this.currtenTime - (elapsed % this.interval);
  }

  pauseResume() {
    if (this.paused) {
      this.resume();
      this.paused = false;
    } else {
      this.pause();
      this.paused = true;
    }
  }
  pause() {
    cancelAnimationFrame(this.rAF);
  }
  resume() {
    if (!this.currtenTime) this.lastTime = performance.now();
    this.updateLastTime();
    this.rAF = requestAnimationFrame(() => this.display());
  }

  start(track: any, onChunk: any) {
    this.onChunk = onChunk;
    this.file.setExtractionOptions(track.id);
    this.file.start();

    this.lastTime = performance.now();
    this.display();
    if (this.paused) this.pause();
  }

  onSamples(track_id: number, ref: any, samples: any) {
    if (!samples || !samples.length) return;
    if (!this.fps) {
      this.fps = this.timescale / samples[0].duration;
      this.interval = 1000 / this.fps;
    }

    track_id;
    ref;

    for (const sample of samples) {
      const type = sample.is_sync ? 'key' : 'delta';

      const chunk = new window.EncodedVideoChunk({
        type,
        timestamp: sample.cts,
        duration: sample.duration,
        data: sample.data,
      });
      this.chunks.push(chunk);
    }
  }
}

class Writer {
  data: Uint8Array;
  idx: number;
  size: number;
  constructor(size: number) {
    this.data = new Uint8Array(size);
    this.idx = 0;
    this.size = size;
  }

  getData() {
    if (this.idx != this.size) throw 'Mismatch between size reserved and sized used';

    return this.data.slice(0, this.idx);
  }

  writeUint8(value: number) {
    this.data.set([value], this.idx);
    this.idx++;
  }

  writeUint16(value: number) {
    // TODO: find a more elegant solution to endianess.
    const arr = new Uint16Array(1);
    arr[0] = value;
    const buffer = new Uint8Array(arr.buffer);
    this.data.set([buffer[1], buffer[0]], this.idx);
    this.idx += 2;
  }

  writeUint8Array(value: ArrayLike<number>) {
    this.data.set(value, this.idx);
    this.idx += value.length;
  }
}

export class MP4Demuxer {
  source: any;
  track: any;
  total = '';
  constructor(uri: string) {
    this.source = new MP4Source(uri);
  }

  getExtradata(avccBox: any) {
    let i,
      size = 7;
    for (i = 0; i < avccBox.SPS.length; i++) {
      // nalu length is encoded as a uint16.
      size += 2 + avccBox.SPS[i].length;
    }
    for (i = 0; i < avccBox.PPS.length; i++) {
      // nalu length is encoded as a uint16.
      size += 2 + avccBox.PPS[i].length;
    }

    const writer = new Writer(size);

    writer.writeUint8(avccBox.configurationVersion);
    writer.writeUint8(avccBox.AVCProfileIndication);
    writer.writeUint8(avccBox.profile_compatibility);
    writer.writeUint8(avccBox.AVCLevelIndication);
    writer.writeUint8(avccBox.lengthSizeMinusOne + (63 << 2));

    writer.writeUint8(avccBox.nb_SPS_nalus + (7 << 5));
    for (i = 0; i < avccBox.SPS.length; i++) {
      writer.writeUint16(avccBox.SPS[i].length);
      writer.writeUint8Array(avccBox.SPS[i].nalu);
      // window.temp = avccBox.SPS[i].nalu;
    }

    writer.writeUint8(avccBox.nb_PPS_nalus);
    for (i = 0; i < avccBox.PPS.length; i++) {
      writer.writeUint16(avccBox.PPS[i].length);
      writer.writeUint8Array(avccBox.PPS[i].nalu);
    }

    return writer.getData();
  }

  async getConfig() {
    const info = await this.source.getInfo();
    this.track = info.videoTracks[0];
    const extradata = this.getExtradata(this.source.getAvccBox());

    const config = {
      codec: this.track.codec,
      codedHeight: this.track.track_height,
      codedWidth: this.track.track_width,
      description: extradata,
    };
    return Promise.resolve(config);
  }

  start(onChunk: any) {
    const { movie_duration, movie_timescale } = this.track;
    this.total = getDurationString(movie_duration / movie_timescale, 30);

    this.source.timescale = this.track.timescale;
    this.source.start(this.track, onChunk);
  }
}
