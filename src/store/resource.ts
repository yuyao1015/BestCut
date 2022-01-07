import type { ResourceFragment, ResourceItem } from '@/logic/resource';
import type { ResourceTab, ResourceLib } from '@/logic/resource-tab';

import { defineStore } from 'pinia';

import { store } from '@/store';
import { tabsData } from '@/views/resource/routes';
import * as Resource from '@/logic/resource';
import { ResourceType } from '@/enums/resource';

interface ResourceState {
  tabs: ResourceTab[];
  activeTab: number;
  selectedLib: number;
  selectedFragment: number;
  resource?: ResourceItem;
  resizeProportion: number;
}

const ResourceMap = {
  [ResourceType.Video]: Resource.VideoResource,
  [ResourceType.Audio]: Resource.AudioResource,
  [ResourceType.Picture]: Resource.PictureResource,
  [ResourceType.Sticker]: Resource.StickerResource,
  [ResourceType.Text]: Resource.TextResource,
  [ResourceType.Effect]: Resource.EffectResource,
  [ResourceType.Filter]: Resource.FilterResource,
  [ResourceType.Transition]: Resource.TransitionResource,
};

export const useResourceStore = defineStore({
  id: 'app-resource',
  state: (): ResourceState => ({
    tabs: tabsData,
    activeTab: 0,
    selectedLib: 0,
    selectedFragment: 0,
    resource: undefined,
    resizeProportion: 1,
  }),
  getters: {
    resourceLibs(): ResourceLib[] {
      return this.tabs[this.activeTab].libs;
    },
    currentLib(): ResourceLib {
      return this.resourceLibs[this.selectedLib];
    },
    currentFragment(): ResourceFragment {
      return this.currentLib.fragments[this.selectedFragment];
    },
    favoriteList(): ResourceItem[] {
      return this.currentLib.fragments.filter((v) => v.name === '收藏')[0].list;
    },
  },
  actions: {
    updateFragments(data: ResourceFragment[]) {
      data.forEach((fragment) => {
        fragment.list = fragment.list.map((resource) => new ResourceMap[resource.type](resource));
      });
      if (data[0].name === '收藏') data.splice(1, 0, ...this.currentLib.fragments);
      else data = this.currentLib.fragments.concat(data);
      this.currentLib.fragments = data;
    },
    switchFragment(idx: number) {
      this.selectedFragment = idx;
      return idx;
    },
    switchLib(idx: number) {
      this.selectedLib = idx;
      return idx;
    },
    switchTab(idx: number) {
      this.activeTab = idx;
      return idx;
    },

    addFavorite(resource: ResourceItem) {
      if (!resource) return;
      resource.checked = true;
      this.favoriteList.push(resource);
    },
    removeFavorite(resource: ResourceItem) {
      const idx = this.favoriteList.indexOf(resource);
      if (idx === -1) return;
      this.favoriteList[idx].checked = false;
      this.favoriteList.splice(idx, 1);
    },
    download(resource: ResourceItem) {
      resource.usable = true;
    },

    setResource(resource?: ResourceItem) {
      if (this.resource?.active) {
        this.resource.active = false;
      }
      if (resource && !resource.active) {
        resource.active = true;
      }
      this.resource = resource;
    },
    addResource(resource: ResourceItem) {
      const idx = this.currentFragment.list.findIndex((v) => v.name === resource.name);
      if (idx !== -1) this.currentFragment.list.splice(idx, 1);
      this.currentFragment.list.unshift(resource);
    },
    onPreviewCanvasSizeChange(resizeProportion: number) {
      this.resizeProportion = resizeProportion;
    },
  },
});

export function useResourceStoreWithOut() {
  return useResourceStore(store);
}
