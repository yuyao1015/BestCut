import type { TrackItem, VideoTrackItem, AudioTrackItem } from '#/track';

export class TimeLine {
  mainTrack: VideoTrackItem[] = [];
  viewTrack: TrackItem[][] = [];
  audioTrack: AudioTrackItem[][] = [];

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
