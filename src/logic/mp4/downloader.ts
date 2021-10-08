import { noop } from '@/utils/index';
import axios from 'axios';

export type DowndloadCallback = (
  response: (ArrayBuffer & { fileStart: number }) | null,
  end: boolean,
  error?: any
) => void;
export type TimeoutCallback = (duration: number) => void;

export class Downloader {
  url = '';

  chunkStart = 0;
  chunkSize = 0;
  totalLength = 0;
  chunkTimeout = 1000;
  timeoutID?: number = 0;

  isActive = false;
  realtime = false;
  eof = false;

  callback: DowndloadCallback = noop;
  timeoutCallback: TimeoutCallback = noop;

  constructor(url: string, callback?: DowndloadCallback, timeoutCallback?: TimeoutCallback) {
    this.setUrl(url);
    this.setCallback(callback || noop);
    this.setTimeoutCallback(timeoutCallback || noop);
  }

  setUrl(url: string) {
    this.url = url;
  }

  setCallback(callback: DowndloadCallback) {
    this.callback = callback;
  }

  setTimeoutCallback(callback: TimeoutCallback) {
    this.timeoutCallback = callback;
  }

  reset() {
    this.chunkStart = 0;
    this.totalLength = 0;
    this.eof = false;
  }

  setChunkSize(size: number) {
    this.chunkSize = size;
  }

  setChunkStart(start: number) {
    this.chunkStart = start;
    this.eof = false;
  }

  setInterval(timeout: number) {
    this.chunkTimeout = timeout;
  }

  isStopped() {
    return !this.isActive;
  }

  getFileLength() {
    return this.totalLength;
  }

  getFile() {
    if (this.totalLength && this.chunkStart >= this.totalLength) {
      this.eof = true;
    }
    if (this.eof === true) {
      // Log.info("Downloader", "File download done.");
      this.callback(null, true);
      return;
    }

    let range = '',
      maxRange;

    if (this.chunkStart + this.chunkSize < Infinity) {
      range = 'bytes=' + this.chunkStart + '-';
      maxRange = this.chunkStart + this.chunkSize - 1;
      /* if the file length is known we limit the max range to that length */
      /*if (this.totalLength !== 0) {
        maxRange = Math.min(maxRange, this.totalLength);
      }*/
      range += maxRange;
    }

    if (!this.isActive) return;

    // Log.info("Downloader", "Fetching "+this.url+(range ? (" with range: "+range): ""));
    axios
      .get(this.url, {
        responseType: 'arraybuffer',
        headers: {
          Range: range,
          start: this.chunkStart,
        },
      })
      .then((res) => {
        if (res.status == 404) {
          this.callback(null, false, true);
        }
        if (
          res.status == 200 ||
          res.status == 206 ||
          res.status == 304 ||
          res.status == 416
          // && res.readyState == 0 //this.DONE
        ) {
          const rangeReceived = res.headers['Content-Range'];
          const contentLenght = res.headers['content-length'];

          // Log.info('Downloader', 'Received data range: ' + rangeReceived);
          /* if the length of the file is not known, we get it from the response header */
          if (!this.totalLength && rangeReceived) {
            const sizeIndex = rangeReceived.indexOf('/');
            if (sizeIndex > -1) this.totalLength = +rangeReceived.slice(sizeIndex + 1);
          }

          this.eof = +contentLenght !== this.chunkSize || +contentLenght === this.totalLength;

          let buffer = res.data;
          if (!buffer.fileStart) {
            buffer = buffer.slice(0);
          }
          buffer.fileStart = this.chunkStart;

          this.callback(buffer, this.eof);

          if (this.isActive && !this.eof) {
            let timeoutDuration = 0;
            if (!this.realtime) {
              timeoutDuration = this.chunkTimeout;
            } else {
              // timeoutDuration = computeWaitingTimeFromBuffer(video);
            }
            if (this.timeoutCallback) this.timeoutCallback(timeoutDuration);
            // Log.info(
            //   'Downloader',
            //   'Next download scheduled in ' + Math.floor(timeoutDuration) + ' ms.'
            // );
            this.timeoutID = window.setTimeout(this.getFile.bind(this), timeoutDuration);
          } else {
            /* end of file */
            this.isActive = false;
          }
        }
      })
      .catch(() => this.callback(null, false, true));
  }

  start() {
    // Log.info('Downloader', 'Starting file download');
    this.chunkStart = 0;
    this.resume();
  }

  resume() {
    // Log.info("Downloader", "Resuming file download");
    this.isActive = true;
    if (this.chunkSize === 0) {
      this.chunkSize = Infinity;
    }
    this.getFile();
  }

  stop() {
    // Log.info("Downloader", "Stopping file download");
    this.isActive = false;
    if (this.timeoutID) {
      window.clearTimeout(this.timeoutID);
      delete this.timeoutID;
    }
  }
}
