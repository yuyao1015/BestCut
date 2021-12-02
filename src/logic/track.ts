import { Base } from './data';
import { TrackType } from '@/enums/track';

import { FireFilled, FilterOutlined } from '@ant-design/icons-vue';

type ItemOptional = {
  id: string;
  name: string;
  boxSize: string;

  active: boolean;
  usable: boolean;

  offset: number;
  height: number;
};

type ItemRequired = {
  type: TrackType;
  duration: string;
};

type TrackOption = Partial<ItemOptional> & ItemRequired;

export class TrackItem extends Base {
  type: TrackType;
  duration: string;

  src?: string;
  icon?: any;
  sticker?: string;
  muted?: boolean;

  active = false;
  offset = 0; // second  convert to marginLeft
  width = 0; // pixel    calculated by (duration + offset)
  height = 0; // pixel
  marginLeft = 0; // pixel
  marginRight = 0; // pixel

  constructor(options: TrackOption) {
    super(options.name, options.id);
    this.type = options.type;
    this.duration = options.duration;
    this.offset = options.offset || 0;
    this.height = options.height || 0;
  }

  getProps() {
    return undefined;
  }
}

export class MediaTrack extends TrackItem {
  refer?: { from: number; to: number };
  src = '';
  muted = false;
}

export class VideoTrack extends TrackItem {
  src?: string;
  audio?: AudioTrack;
  cover?: string[];

  constructor(
    options: Omit<TrackOption, 'type'> & { src?: string; audio?: AudioTrack; cover?: string[] }
  ) {
    super(Object.assign({ type: TrackType.Video, height: 84 }, options));
    this.src = options.src;
    this.cover = options.cover;
    this.audio = options.audio;
  }
}

export class AudioTrack extends TrackItem {
  src?: string;
  wave?: string;
  muted? = false;
  constructor(options: Omit<TrackOption, 'type'> & { src?: string; wave?: string }) {
    super(Object.assign({ type: TrackType.Audio, height: 60 }, options));
    this.src = options.src;
    this.wave = options.wave;
  }
}

export class StickerTrack extends TrackItem {
  sticker: string;
  constructor(options: Omit<TrackOption, 'type'> & { sticker: string }) {
    super(Object.assign({ type: TrackType.Sticker, height: 20 }, options));
    this.sticker = options.sticker;
  }
}

export class FilterTrack extends TrackItem {
  icon: any;
  constructor(options: Omit<TrackOption, 'type'> & { icon?: any }) {
    super(Object.assign({ type: TrackType.Text, height: 20 }, options));
    this.icon = options.icon || FilterOutlined;
  }
}

export class EffectTrack extends TrackItem {
  icon: any;
  constructor(options: Omit<TrackOption, 'type'> & { icon?: any }) {
    super(Object.assign({ type: TrackType.Effect, height: 20 }, options));
    this.icon = options.icon || FireFilled;
  }
}

export class TextTrack extends TrackItem {
  constructor(options: Omit<TrackOption, 'type'>) {
    super(Object.assign({ type: TrackType.Text, height: 20 }, options));
  }
}

export type TrackMap = {
  video: TrackItem[][];
  main: VideoTrack[];
  audio: AudioTrack[][];
};

export function isMedia(type: TrackType) {
  return [TrackType.Video, TrackType.Audio].includes(type);
}
