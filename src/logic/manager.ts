import { Track, TrackItem, TrackItemAudio, TrackItemVideo } from './data';

export class TimeLine {
    mainTrack: TrackItemVideo[] = [];
    viewTrack: TrackItem[][] = [];
    audioTrack: TrackItemAudio[][] = [];

    remove(id: string) {

    }
}


export class Manager {
    timeline: TimeLine;

    constructor() {
        this.timeline = new TimeLine();
    }

    exportProject() {

    }
}