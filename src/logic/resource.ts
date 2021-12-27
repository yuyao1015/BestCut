import type { VNode } from 'vue';

import { Base } from './data';
import { ResourceType } from '@/enums/resource';

import * as Track from './track';

type ItemOptional = {
  id: string;
  name: string;
  boxSize: string;

  active: boolean;
  usable: boolean;
  favorite: boolean;
  showAdd: boolean;
  checked: boolean;
  referenced: boolean;
};

type ItemRequired = {
  type: ResourceType;
  src: string;
  cover: string;
  duration: string;
};

type ResourceOption = Partial<ItemOptional> & ItemRequired;

const TrackCtorMap = {
  [ResourceType.Video]: Track.VideoTrack,
  [ResourceType.Audio]: Track.AudioTrack,
  [ResourceType.Picture]: Track.VideoTrack,
  [ResourceType.Sticker]: Track.StickerTrack,
  [ResourceType.Text]: Track.TextTrack,
  [ResourceType.Effect]: Track.EffectTrack,
  [ResourceType.Filter]: Track.FilterTrack,
  [ResourceType.Transition]: Track.TransitionTrack,
};
export class ResourceItem extends Base {
  src: string;
  type: ResourceType;
  duration: string;
  cover: string;

  usable = false;
  showAdd = false;
  checked = false;
  favorite = false;
  referenced = false;
  active = false;

  constructor(options: ResourceOption) {
    super(options.name, options.id);
    this.src = options.src;
    this.type = options.type;
    this.cover = options.cover;
    this.duration = options.duration;
  }

  getProps() {
    return undefined;
  }

  toTrack() {
    return new TrackCtorMap[this.type](this as any);
  }
}

export class VideoResource extends ResourceItem {
  constructor(options: Omit<ResourceOption, 'type'>) {
    super(Object.assign({ type: ResourceType.Video }, options));
  }
  toTrack() {
    return new Track.VideoTrack(this as Track.TrackOption);
  }
}

export class AudioResource extends ResourceItem {
  album?: string;
  author?: string;
  constructor(options: Omit<ResourceOption, 'type'> & { album?: string; author?: string }) {
    super(Object.assign({ type: ResourceType.Audio }, options));
    this.album = options.album;
    this.author = options.author;
  }
}

export class PictureResource extends ResourceItem {
  constructor(options: Omit<ResourceOption, 'type'>) {
    super(Object.assign({ type: ResourceType.Picture }, options));
  }
}

export class StickerResource extends ResourceItem {
  constructor(options: Omit<ResourceOption, 'type'>) {
    super(Object.assign({ type: ResourceType.Sticker }, options));
  }
}

export class FilterResource extends ResourceItem {
  constructor(options: Omit<ResourceOption, 'type'>) {
    super(Object.assign({ type: ResourceType.Text }, options));
  }
}

export class EffectResource extends ResourceItem {
  constructor(options: Omit<ResourceOption, 'type'>) {
    super(Object.assign({ type: ResourceType.Effect }, options));
  }
}

export class TextResource extends ResourceItem {
  constructor(options: Omit<ResourceOption, 'type'>) {
    super(Object.assign({ type: ResourceType.Text }, options));
  }
}

export interface ResourceFragment {
  name?: string;
  usable?: boolean;
  favorite?: boolean;
  showAdd?: boolean;
  list: ResourceItem[];
}

export class ResourceLib {
  libName = '';
  fragments: ResourceFragment[] = [];
  component: (list: ResourceFragment[]) => JSX.Element;
  constructor(libName: string, component: (list: ResourceFragment[]) => JSX.Element) {
    this.libName = libName;
    this.component = component;
  }
}

export interface ResourceTab {
  tabName: string;
  name: string;
  icon?: VNode;
  libs: ResourceLib[];
}
