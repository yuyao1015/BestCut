import { ResourceType } from '@/enums/resource';
import {
  TrackMap,
  TrackItem,
  AttachmentTrack,
  MediaTrack,
  isMedia,
  isVideo,
  isAudio,
} from '@/logic/tracks';
import { durationString2Sec } from '@/utils/player';
import { MP4Player } from '@/logic/mp4';
import { CanvasId } from '@/settings/playerSetting';

export type Attachment = {
  track: AttachmentTrack;
  startFrame: number;
  endFrame: number;
  // offset: number; // TODO: for segmented attachment
};

export type DisplayItem = {
  active: boolean;
  track?: MediaTrack;
  startTime: number; // ms
  endTime: number;
  offset: number;
  attachments?: Attachment[];
};

type DisplayQueue = {
  [ResourceType.Video]: DisplayItem[];
  [ResourceType.Audio]: DisplayItem[];
};

let player: MP4Player;
let extractor: MP4Player | undefined;

export class TrackManager {
  map: TrackMap;
  active = false;
  paused = true;
  rAF = 0;
  private lastTime = 0; // ms
  private _duration = 0; // ms
  currentTime = 0; // ms
  displayedIdx = 0;
  displayed?: DisplayItem;
  displayQueue: DisplayQueue = { video: [], audio: [] };

  constructor(map?: TrackMap) {
    this.map = map || { video: [], main: [], audio: [] };
    this.updateQueue();
  }

  updateMap(map: TrackMap) {
    this.map = map;
    this.updateQueue();
  }

  // media track overlap on timeline, upper layer display first
  updateQueue() {
    const idx = this.map.video.findIndex((list) => isVideo(list[0].type));
    // const { audio } = this.map;
    const attachment = this.map.video.slice(0, idx);
    const video = this.map.video.slice(idx).concat(this.map.main.length ? [this.map.main] : []);

    this.flatten(video);
    this.flatten(attachment);
    this.addTransition();
    // this.flatten(audio);
    // console.log(this.displayQueue.video);
  }

  addTransition() {
    const ids = this.map.main.map((item) => item.id);
    this.displayQueue.video.reduce((t, item, i) => {
      if (!item.track || !ids.includes(item.track.id)) return t;

      if (t) {
        item.startTime -= t;
        item.endTime -= t;
      }

      if (item.track?.transition) {
        const { fn, duration } = item.track.transition;
        const d = durationString2Sec(duration);
        t += d * 1000;
        item.endTime -= d * 1000;
        let endFrame = d * 30;
        const next = this.displayQueue.video[i + 1];
        next.attachments?.push({
          track: item.track.transition,
          startFrame: 0,
          endFrame,
        });

        item.track.transition.fn = async function (...args) {
          const _canvas = (await extractor!.extract()) as HTMLCanvasElement;
          this.renderToScreen = false;
          this.buffer = this.buffer2;
          this.draw(_canvas, extractor!.attachments, extractor!.chunkStart);
          this.buffer = this.buffer1;
          this.renderToScreen = true;
          if (!endFrame--) extractor = undefined;
          return fn.apply(this, [...args, this.buffer2]);
        };
      }
      return t;
    }, 0);
  }

  flatten(lists: (MediaTrack | AttachmentTrack)[][]) {
    if (!lists.length) return;

    let type: keyof DisplayQueue;
    if (!isMedia(lists[0][0].type)) type = ResourceType.Video;
    else type = lists[0][0].type as keyof DisplayQueue;

    const que = this.displayQueue[type];

    lists.forEach((list, i) => {
      list.reduce((endTime, track) => {
        let startTime;
        if (isVideo(track.type) && this.map.main.length && i === lists.length - 1) {
          startTime = endTime;
        } else {
          startTime = track.offset + endTime;
        }

        endTime = startTime + durationString2Sec(track.duration);
        const item = Object.assign(
          {
            active: false,
            startTime: startTime * 1000,
            endTime: endTime * 1000,
            track,
            offset: 0,
          },
          isMedia(track.type) ? { attachments: [] } : {}
        );

        // first video row has always been displayed
        if (i === 0 && isVideo(track.type)) que.push(item);
        else this.enque(que, item);
        return endTime;
      }, 0);
    });
  }

  enque(que: DisplayItem[], item: DisplayItem) {
    if (isVideo(item.track?.type)) {
      this._venque(que, item);
    } else if (isAudio(item.track?.type)) {
      // this._aenque(que, item);
    } else {
      this._enque(que, item);
    }
  }

  _enque(que: DisplayItem[], item: DisplayItem, l = 0, r = 0): void {
    const track = item.track as AttachmentTrack;
    if (!track || item.startTime === item.endTime) return;

    const fps = player?.fps || 30;
    r = r ? r : que.length - 1;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const target = que[mid];
      const itemLeft = Object.assign({}, item, { endTime: target.startTime });
      const itemRight = Object.assign({}, item, { startTime: target.endTime });

      if (target.endTime <= item.startTime) l = mid + 1;
      else if (target.startTime >= item.endTime) r = mid - 1;
      // fully covered
      else if (target.startTime <= item.startTime && target.endTime >= item.endTime) {
        target.attachments?.push({
          track,
          startFrame: ((item.startTime - target.startTime) * fps) / 1000,
          endFrame: ((item.endTime - target.startTime) * fps) / 1000,
        });
        return;
      }
      // bilateral slice
      else if (item.startTime < target.startTime && item.endTime > target.endTime) {
        this._enque(que, itemLeft, l, mid - 1);
        return this._enque(que, itemRight, mid + 1, 0);
      }
      // left slice
      else if (target.endTime > item.endTime) {
        return this._enque(que, itemLeft, l, mid - 1);
        // right slice
      } else if (target.startTime < item.startTime) {
        return this._enque(que, itemRight, mid + 1, r);
      }
    }
    item.attachments = [
      { track, startFrame: (item.startTime * fps) / 1000, endFrame: (item.endTime * fps) / 1000 },
    ];
    item.track = undefined;
    que.splice(l, 0, item);
  }

  _venque(que: DisplayItem[], item: DisplayItem, l = 0, r = 0): void {
    if (item.startTime === item.endTime) return;
    r = r ? r : que.length - 1;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const target = que[mid];
      const itemLeft = Object.assign({}, item, { endTime: target.startTime });
      const offset = item.offset + target.endTime - item.startTime;
      const itemRight = Object.assign({}, item, { startTime: target.endTime, offset });

      if (target.endTime <= item.startTime) l = mid + 1;
      else if (target.startTime >= item.endTime) r = mid - 1;
      // fully covered
      else if (target.startTime <= item.startTime && target.endTime >= item.endTime) return;
      // bilateral slice
      else if (item.startTime <= target.startTime && item.endTime >= target.endTime) {
        this._venque(que, itemLeft, l, mid - 1);
        return this._venque(que, itemRight, mid + 1, 0);
      }
      // left slice
      else if (target.endTime >= item.endTime) {
        return this._venque(que, itemLeft, l, mid - 1);
        // right slice
      } else if (target.startTime <= item.startTime) {
        return this._venque(que, itemRight, mid + 1, r);
      }
    }
    que.splice(l, 0, item);
  }

  // _aenque(que: DisplayItem[], item: DisplayItem) {}

  duration() {
    const ends: number[] = [];
    ends.push(this.listEnd(this.map.main));
    ends.push(this.map.video.reduce((t, list) => Math.max(t, this.listEnd(list)), 0));
    ends.push(this.map.audio.reduce((t, list) => Math.max(t, this.listEnd(list)), 0));
    return Math.max(...ends);
  }

  listEnd(list: TrackItem[]) {
    return list.reduce(
      (t, trak) =>
        t +
        trak.offset +
        durationString2Sec(trak.duration) -
        (trak instanceof MediaTrack && trak.transition
          ? durationString2Sec(trak.transition.duration)
          : 0),
      0
    );
  }

  private async _play() {
    this.currentTime = performance.now() - this.lastTime;
    if (this.displayed && this.currentTime < this._duration) {
      const startTime = Math.abs(this.currentTime - this.displayed.startTime);
      const endTime = Math.abs(this.currentTime - this.displayed.endTime);

      if (endTime < 17) {
        this.displayed.active = false;
        if (this.displayed.track?.transition) {
          extractor = player;
          extractor.setCanvas(extractor.canvas.cloneNode() as HTMLCanvasElement);
        } else {
          player?.stop();
        }

        this.displayed = this.displayQueue.video[++this.displayedIdx];
        if (!this.displayed) {
          this.active = false;
          player?.stop();
        }
      }

      if (startTime < 17 && !this.displayed.active) {
        this.displayed.active = true;

        player = new MP4Player({ id: CanvasId, url: this.displayed.track?.src });
        player.attachments = this.displayed.attachments || [];

        if (this.displayed.offset) {
          await player.samplesLoaded();
          const idx = (this.displayed.offset / 1000) * 30;
          player.jumpTo(idx);
        }
      }
    }

    this.rAF = requestAnimationFrame(() => this._play());
  }

  play() {
    this.active = true;
    this.paused = false;
    this._duration = this.duration() * 1000;
    this.displayed = this.displayQueue.video[this.displayedIdx];
    this.lastTime = performance.now();
    this._play();
  }

  async jumpTo(tp: number) {
    this.lastTime -= tp - this.currentTime;
    this.currentTime = tp;
    const { displayed, paused } = this;
    if (displayed && tp > displayed.startTime && tp < displayed.endTime) {
      const idx = ((tp - displayed.startTime + displayed.offset) * player.fps) / 1000;
      return player.jumpTo(Math.floor(idx));
    }
    player.stop();
    displayed && (displayed.active = false);

    let l = 0;
    let r = this.displayQueue.video.length - 1;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const target = this.displayQueue.video[mid];
      if (tp < target.startTime) r = mid - 1;
      else if (tp > target.endTime) l = mid + 1;
      else {
        player = new MP4Player({ id: CanvasId, url: target.track?.src });
        await this.holdOn();
        const idx = ((tp - target.startTime) * player.fps) / 1000;
        player.jumpTo(Math.floor(idx));

        this.displayedIdx = mid;
        this.displayed = target;
        this.displayed.active = true;
        player.attachments = this.displayed.attachments || [];
        if (!paused) this.pauseResume();
        break;
      }
    }
    if (l > r) {
      this.displayed = undefined;
      this.displayedIdx = 0;
      player.renderer?.clear();
    }
  }

  async holdOn() {
    this.pause();
    await player.samplesLoaded();
    player.prevFrame(player.chunkSize);
    player.prevFrame(1);
  }

  prevFrame(n: number) {
    if (!player || !this.displayed) return;
    const s = 1000 / player.fps;
    const tp = Math.max(this.currentTime - s, 0);
    if (this.displayed.startTime - tp > 17) {
      this.jumpTo(tp);
      return;
    }
    player.prevFrame(n);
    this.lastTime += s;
    this.currentTime = tp;
  }
  nextFrame(n: number) {
    if (!player || !this.displayed) return;
    const s = 1000 / player.fps;
    const tp = Math.min(this.currentTime + s, this.duration() * 1000);
    if (tp - this.displayed.endTime > 17) {
      this.jumpTo(tp);
      return;
    }
    player.nextFrame(n);
    this.lastTime -= s;
    this.currentTime = tp;
  }

  pauseResume() {
    if (this.paused) this.resume();
    else this.pause();
  }

  pause() {
    this.rAF && cancelAnimationFrame(this.rAF);
    player?.pauseResume();
    this.paused = true;
  }

  resume() {
    this.lastTime += performance.now() - this.lastTime - this.currentTime;
    this.rAF = requestAnimationFrame(() => this._play());
    player?.pauseResume();
    this.paused = false;
  }

  export() {
    console.log('export');
  }

  updateSize() {
    player?.updateSize();
  }
}
