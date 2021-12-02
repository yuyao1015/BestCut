import { VideoTrack, TrackItem, AudioTrack } from './track';

export class TimeLine {
  mainTrack: VideoTrack[] = [];
  viewTrack: TrackItem[][] = [];
  audioTrack: AudioTrack[][] = [];

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
