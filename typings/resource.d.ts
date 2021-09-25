import type { VNode } from 'vue';

import { ResourceType } from '@/enums/resource';

type Item = {
  usable: boolean;
  showAdd: boolean;
  favorite: boolean;
  checked: boolean;
  referenced: boolean;
  resourceName: string;
  boxSize: string;
  cover: string;
  duration: string;
};

export interface VideoResourceItem extends Partial<Item> {
  // type: ResourceType.Video;
  type: string;
}
export interface AudioResourceItem extends Partial<Item> {
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
