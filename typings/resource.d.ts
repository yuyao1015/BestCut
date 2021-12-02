import type { VNode } from 'vue';

// import { ResourceType } from '@/enums/resource';

type ItemOptional = {
  active: boolean;
  usable: boolean;
  showAdd: boolean;
  favorite: boolean;
  checked: boolean;
  referenced: boolean;
  name: string;
  boxSize: string;
  cover: string;
  src: string;
  duration: string;
};

type ItemRequired = {
  //
};

type Item = Partial<ItemOptional> & ItemRequired;

export interface VideoResourceItem extends Item {
  // type: ResourceType.Video;
  type: string;
}
export interface AudioResourceItem extends Item {
  // type: ResourceType.Audio;
  type: string;
  album?: string;
  author?: string;
}

export type ResourceItem = VideoResourceItem & AudioResourceItem;

export interface ResourceFragment {
  name?: string;
  usable?: boolean;
  favorite?: boolean;
  showAdd?: boolean;
  list: ResourceItem[];
}

export interface ResourceLibItem {
  libName: string;
  fragments: ResourceFragment[];
  component: (list: ResourceFragment[]) => any;
  boxSize?: string;
}

export interface ResourceTabItem {
  tabName: string;
  name: string;
  icon?: VNode;
  libs: ResourceLibItem[];
}

export interface PixiCanvasProps {
  backgroundColor: string;
  width: number;
  height: number;
  position: { left?: number; top?: number; right?: number; bottom?: number };
}
