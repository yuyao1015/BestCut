type Item = {
  active: boolean;
  usable: boolean;
  trackName: string;
  boxSize: string;
  duration: string;
  icon: any;
  sticker: string;
  width: number;
  offset: number;
  marginLeft: number;
};

export interface AudioTrackItem extends Partial<Item> {
  id: string;
  type: string;
  wave?: string;
}

export interface VideoTrackItem extends Partial<Item> {
  id: string;
  type: string;
  src?: string;
  audio?: AudioTrackItem;
  cover?: string[];
}

export type TrackItem = VideoTrackItem & AudioTrackItem;
