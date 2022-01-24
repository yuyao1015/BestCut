import type { VNode } from 'vue';

import { RESOURCES } from '@/assets/resources';
import { ResourceFragment } from '@/logic/resource';

export class ResourceLib {
  fragments: ResourceFragment[];
  constructor(
    public libName: string,
    public component: (list: ResourceFragment[]) => JSX.Element,
    public update: number = -1
  ) {
    this.fragments = RESOURCES[libName] || [];
  }
}

export interface ResourceTab {
  tabName: string;
  name: string;
  icon?: VNode;
  libs: ResourceLib[];
}
