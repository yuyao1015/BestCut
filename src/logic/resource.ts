import { Base } from './data';
import { ResourceType } from '@/enums/resource';

export enum ResourceLoc {
  WrapTop = 1,
  Top,
}

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

export class ResourceItem extends Base {
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
    this.type = options.type;
    this.cover = options.cover;
    this.duration = options.duration;
  }

  getProps() {
    return undefined;
  }
}

export class VideoResource extends ResourceItem {
  constructor(options: Omit<ResourceOption, 'type'>) {
    super(Object.assign({ type: ResourceType.Video }, options));
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

export class StickerResource extends ResourceItem {
  constructor(options: Omit<ResourceOption, 'type'>) {
    super(Object.assign({ type: ResourceType.Sticker }, options));
  }
}

export class FilterResource extends ResourceItem {
  icon: any;
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
