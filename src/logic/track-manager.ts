import { ResourceType } from '@/enums/resource';
import { TrackMap, TrackItem, AttachmentTrack, MediaTrack, isMedia } from '@/logic/track';
import { durationString2Sec } from '@/utils/player';
import { MP4Player } from '@/logic/mp4';
import { CanvasId } from '@/settings/playerSetting';

export type Attachment = {
  track: AttachmentTrack;
  // offset: number; // TODO: for segmented attachment
  startFrame: number;
  endFrame: number;
};

export type DisplayItem = {
  active: boolean;
  track?: MediaTrack;
  startTime: number;
  endTime: number;
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
  private lastTime = 0;
  private _duration = 0;
  rAF = 0;
  currentTime = 0;
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
    const idx = this.map.video.findIndex((list) => list[0].type === ResourceType.Video);
    // const { audio } = this.map;
    const attachment = this.map.video.slice(0, idx);
    const video = this.map.video.slice(idx).concat(this.map.main.length ? [this.map.main] : []);

    this.flatten(video);
    this.flatten(attachment);
    // console.log(this.displayQueue.video);
    this.addTransition();
    // this.flatten(audio);
  }

  addTransition() {
    this.displayQueue.video.reduce((t, item, i) => {
      if (!item.track) return t;

      if (t) {
        item.startTime -= t;
        item.endTime -= t;
      }

      if (item.track?.transition) {
        const { fn, duration } = item.track.transition;
        const d = durationString2Sec(duration);
        t += d;
        item.endTime -= d;
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
      list.reduce((endTime, track, j) => {
        let startTime;
        if (track.type === ResourceType.Video && this.map.main.length && i === lists.length - 1) {
          startTime = durationString2Sec(list[j - 1]?.duration);
        } else {
          startTime = track.offset + endTime;
        }

        endTime = startTime + durationString2Sec(track.duration);
        const item = Object.assign(
          {
            active: false,
            startTime,
            endTime,
            track,
          },
          isMedia(track.type) ? { attachments: [] } : {}
        );

        // first video row has always been displayed
        if (i === 0 && track.type === ResourceType.Video) que.push(item);
        else this.enque(que, item);
        return endTime;
      }, 0);
    });
  }

  enque(que: DisplayItem[], item: DisplayItem) {
    if (item.track?.type === ResourceType.Video) {
      this._venque(que, item);
    } else if (item.track?.type === ResourceType.Audio) {
      this._aenque(que, item);
    } else {
      this._enque(que, item);
    }
  }

  _enque(que: DisplayItem[], item: DisplayItem) {
    const track = item.track as AttachmentTrack;
    if (!track) return;

    const fps = player?.fps || 30;
    const n = que.length - 1;
    let l = 0,
      r = n;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const target = que[mid];
      const itemLeft = Object.assign({}, item, { endTime: target.startTime });
      const itemRight = Object.assign({}, item, { startTime: target.endTime });

      if (target.endTime <= item.startTime) l = mid < r ? mid + 1 : r;
      else if (target.startTime >= item.endTime) r = mid > l ? mid - 1 : l;
      // fully covered
      else if (target.startTime <= item.startTime && target.endTime >= item.endTime) {
        target.attachments?.push({
          track,
          startFrame: (item.startTime - target.startTime) * fps,
          endFrame: (item.endTime - target.startTime) * fps,
        });
        return;
      }
      // bilateral slice
      else if (item.startTime < target.startTime && item.endTime > target.endTime) {
        this._enque(que, itemLeft);
        this._enque(que, itemRight);
        return;
      }
      // left slice
      else if (target.endTime > item.endTime) {
        this._enque(que, itemLeft);
        return;
        // right slice
      } else if (target.startTime < item.startTime) {
        this._enque(que, itemRight);
        return;
      }
    }
    item.attachments = [{ track, startFrame: item.startTime * fps, endFrame: item.endTime * fps }];
    item.track = undefined;
    que.splice(l, 0, item);
  }

  _venque(que: DisplayItem[], item: DisplayItem) {
    const n = que.length;
    let l = 0,
      r = n;

    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const target = que[mid];
      const itemLeft = Object.assign({}, item, { endTime: target.startTime });
      const itemRight = Object.assign({}, item, { startTime: target.endTime });

      if (target.endTime <= item.startTime) l = mid + 1;
      else if (target.startTime >= item.endTime) r = mid - 1;
      // fully covered
      else if (target.startTime <= item.startTime && target.endTime >= item.endTime) return;
      // bilateral slice
      else if (item.startTime < target.startTime && item.endTime > target.endTime) {
        this._venque(que, itemLeft);
        this._venque(que, itemRight);
        return;
      }
      // left slice
      else if (target.endTime > item.endTime) {
        this._venque(que, itemLeft);
        return;
        // right slice
      } else if (target.startTime < item.startTime) {
        this._venque(que, itemRight);
        return;
      }
    }
    que.splice(l, 0, item);
  }

  _aenque(que: DisplayItem[], item: DisplayItem) {}

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

  private _play() {
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
        } else {
          this.displayed.startTime *= 1000;
          this.displayed.endTime *= 1000;
        }
      }

      if (startTime < 17 && !this.displayed.active) {
        this.displayed.active = true;

        player = new MP4Player({ id: CanvasId, url: this.displayed.track?.src });
        console.log(this.displayed.attachments);
        player.attachments = this.displayed.attachments || [];
      }
    }

    this.rAF = requestAnimationFrame(() => this._play());
  }

  play() {
    this.active = true;
    this.paused = false;
    this._duration = this.duration() * 1000;
    this.displayed = this.displayQueue.video[this.displayedIdx];
    this.displayed.startTime *= 1000;
    this.displayed.endTime *= 1000;
    this.lastTime = performance.now();
    this._play();
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
