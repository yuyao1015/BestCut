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

export type ResourceItem = VideoResourceItem | AudioResourceItem;

export interface ResourceFragment {
  name?: string;
  usable?: boolean;
  list: ResourceItem[];
}

export interface ResourceLibItem {
  title: string;
  fragments: ResourceFragment[];
  component?: VNode;
  boxSize?: string;
}

export interface ResourceTabItem {
  icon?: VNode;
  name: string;
}
