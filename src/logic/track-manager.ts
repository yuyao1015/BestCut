import { ResourceType } from '@/enums/resource';
import { TrackMap, TrackItem } from '@/logic/track';
import { durationString2Sec } from '@/utils/player';

type DisplayItem = {
  track: TrackItem;
  startTime: number;
  endTime: number;
};

type DisplayQueue = {
  [ResourceType.Video]: DisplayItem[];
  [ResourceType.Audio]: DisplayItem[];
};

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
  }

  updateMap(map: TrackMap) {
    this.map = map;
    this.updateQueue();
  }

  // media track overlap on timeline, upper layer display first
  updateQueue() {
    const idx = this.map.video.findIndex((list) => list[0].type === ResourceType.Video);
    const { audio } = this.map;
    const attachment = this.map.video.slice(0, idx);
    const video = this.map.video.slice(idx).concat([this.map.main]);

    this.flatten(video);
    // this.flatten(audio);
    // this.flatten(attachment);
  }

  flatten(lists: TrackItem[][]) {
    const type = lists[0][0].type as keyof DisplayQueue;
    const que = this.displayQueue[type];

    lists.forEach((list, i) => {
      list.reduce((endTime, track) => {
        const startTime = track.offset + endTime;
        endTime = startTime + durationString2Sec(track.duration);
        const item = {
          track,
          startTime: startTime * 1000,
          endTime: endTime * 1000,
        };

        // first row has always been displayed
        if (i === 0) que.push(item);
        else this.enque(que, item);
        return endTime;
      }, 0);
    });
  }

  enque(que: DisplayItem[], item: DisplayItem) {
    const n = que.length;
    let l = 0,
      r = n;
    while (l < r) {
      const mid = l + Math.floor((r - l) / 2);
      const target = que[mid];
      if (target.endTime <= item.startTime) l = mid < r ? mid + 1 : r;
      else if (target.startTime >= item.endTime) r = mid > l ? mid - 1 : l;
      else if (target.startTime <= item.startTime && target.endTime >= item.endTime) return;
      else if (target.endTime >= item.endTime) {
        const prev = que[mid - 1];
        if (!prev) {
          item.endTime = target.startTime;
          que.splice(mid, 0, item);
          return;
        }
        // overlap
        if (prev.endTime >= target.startTime) {
          if (prev.startTime <= item.startTime) return;
          item.endTime = prev.startTime;
          que.splice(mid, 0, item);
        } else {
          item.endTime = target.startTime;
          if (prev.startTime <= item.startTime) {
            que.splice(mid, 0, item);
            return;
          }
          item.startTime = prev.endTime;
          que.splice(mid, 0, item);
        }
        return;
      } else {
        const next = que[mid + 1];
        if (!next) {
          item.startTime = target.endTime;
          que.splice(mid + 1, 0, item);
          return;
        }

        if (next.startTime <= target.endTime) {
          if (next.endTime >= item.endTime) return;
          item.startTime = next.endTime;
          que.splice(mid + 1, 0, item);
        } else {
          item.startTime = target.endTime;
          if (next.endTime >= item.endTime) {
            que.splice(mid + 1, 0, item);
            return;
          }
          item.endTime = next.startTime;
          que.splice(mid + 1, 0, item);
        }
        return;
      }
    }
    if (l === 0 && r === 0) que.unshift(item);
    if (l === n && r === n) que.push(item);
  }

  duration() {
    const ends: number[] = [];
    ends.push(this.listEnd(this.map.main));
    ends.push(this.map.video.reduce((t, list) => t + this.listEnd(list), 0));
    ends.push(this.map.audio.reduce((t, list) => t + this.listEnd(list), 0));
    return Math.max(...ends);
  }

  listEnd(list: TrackItem[]) {
    return list.reduce((t, trak) => t + trak.offset + durationString2Sec(trak.duration), 0);
  }

  private _play() {
    this.currentTime = performance.now() - this.lastTime;
    if (this.displayed && this.currentTime < this._duration) {
      if (Math.abs(this.currentTime - this.displayed.endTime) < 17) {
        this.displayed.track.pauseResume();
        this.displayed = this.displayQueue.video[++this.displayedIdx];
        if (!this.displayed) {
          this.active = false;
        }
      }

      if (Math.abs(this.currentTime - this.displayed.startTime) < 17) {
        this.displayed.track.play();
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

  pauseResume() {
    if (this.paused) this.resume();
    else this.pause();
  }

  pause() {
    this.rAF && cancelAnimationFrame(this.rAF);
    this.displayed?.track.pauseResume();
    this.paused = true;
  }

  resume() {
    this.lastTime += performance.now() - this.lastTime - this.currentTime;
    this.rAF = requestAnimationFrame(() => this._play());
    this.displayed?.track.pauseResume();
    this.paused = false;
  }
}
