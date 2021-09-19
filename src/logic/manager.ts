import { TrackItem, TrackItemAudio, TrackItemVideo } from './data';

export class TimeLine {
  mainTrack: TrackItemVideo[] = [];
  viewTrack: TrackItem[][] = [];
  audioTrack: TrackItemAudio[][] = [];

  remove(id: string) {
    //   TODO:
    id;
  }
}

export class Manager {
  timeline: TimeLine;

  constructor() {
    this.timeline = new TimeLine();
  }

  exportProject() {
    //   TODO:
  }
}
