type ItemOptional = {
  active: boolean;
  usable: boolean;
  trackName: string;
  boxSize: string;
  duration: string;
  icon: any;
  sticker: string;
};

type ItemRequired = {
  id: string;
  start: number;
  end: number;
  width: number; // pixel
  height: number; // pixel
  offset: number; // second
  marginLeft: number; // pixel
  marginRight: number; // pixel
};

type Item = Partial<ItemOptional> & ItemRequired;

export interface AudioTrackItem extends Item {
  type: string;
  wave?: string;
}

export interface VideoTrackItem extends Item {
  type: string;
  src?: string;
  audio?: AudioTrackItem;
  cover?: string[];
}

export type TrackItem = VideoTrackItem & AudioTrackItem;

export type TrackMap = {
  video: TrackItem[][];
  main: TrackItem[];
  audio: AudioTrackItem[][];
};
