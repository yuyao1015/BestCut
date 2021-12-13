import { v4 as uuid } from 'uuid';
import { FireFilled, FilterOutlined } from '@ant-design/icons-vue';

import { Base } from './data';
import { ResourceType } from '@/enums/resource';
import { deepCopy } from '@/utils';
import { MP4Player } from '@/logic/mp4';
import { CanvasId } from '@/settings/playerSetting';

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
  type: ResourceType;
  duration: string;
};

export type TrackOption = Partial<ItemOptional> & ItemRequired;

let player: MP4Player;
export class TrackItem extends Base {
  type: ResourceType;
  duration: string;

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

  clone() {
    const clone = deepCopy(this);
    clone.id = uuid();
    return clone;
  }

  play() {}
  pauseResume() {}
}

export class MediaTrack extends TrackItem {
  refer?: { from: number; to: number };
  src?: string;
}

export class VideoTrack extends MediaTrack {
  audio?: AudioTrack;
  cover?: string[];

  constructor(
    options: Omit<TrackOption, 'type'> & { src?: string; audio?: AudioTrack; cover?: string[] }
  ) {
    super(Object.assign({ type: ResourceType.Video, height: 84 }, options));
    this.src = options.src || '';
    this.cover = options.cover;
    this.audio = options.audio;
  }

  play() {
    if (this.src) {
      player = new MP4Player({ id: CanvasId, url: this.src });
    }
  }

  pauseResume() {
    player?.pauseResume();
  }
}

export class AudioTrack extends MediaTrack {
  wave?: string;
  muted?: boolean;
  constructor(options: Omit<TrackOption, 'type'> & { src: string; wave?: string }) {
    super(Object.assign({ type: ResourceType.Audio, height: 60 }, options));
    this.src = options.src;
    this.wave = options.wave;
  }
}

export class StickerTrack extends TrackItem {
  sticker: string;
  constructor(options: Omit<TrackOption, 'type'> & { sticker: string }) {
    super(Object.assign({ type: ResourceType.Sticker, height: 20 }, options));
    this.sticker = options.sticker;
  }
}

export class FilterTrack extends TrackItem {
  icon: any;
  constructor(options: Omit<TrackOption, 'type'> & { icon?: any }) {
    super(Object.assign({ type: ResourceType.Filter, height: 20 }, options));
    this.icon = options.icon || FilterOutlined;
  }
}

export class EffectTrack extends TrackItem {
  icon: any;
  constructor(options: Omit<TrackOption, 'type'> & { icon?: any }) {
    super(Object.assign({ type: ResourceType.Effect, height: 20 }, options));
    this.icon = options.icon || FireFilled;
  }
}

export class TextTrack extends TrackItem {
  constructor(options: Omit<TrackOption, 'type'>) {
    super(Object.assign({ type: ResourceType.Text, height: 20 }, options));
  }
}

export type TrackMap = {
  video: TrackItem[][];
  main: VideoTrack[];
  audio: AudioTrack[][];
};

export function isMedia(type: ResourceType) {
  return [ResourceType.Video, ResourceType.Audio].includes(type);
}
