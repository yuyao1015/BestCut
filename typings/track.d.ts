type Item = {
  active: boolean;
  usable: boolean;
  trackName: string;
  boxSize: string;
  duration: string;
  icon?: () => [];
};

export interface AudioTrackItem extends Partial<Item> {
  id: string;
  type: string;
  wave?: string;
}

export interface VideoTrackItem extends Partial<Item> {
  id: string;
  type: string;
  audio?: AudioTrackItem;
  cover?: string[];
}

export type TrackItem = VideoTrackItem & AudioTrackItem;
