import type { ResourceTabItem, ResourceLibItem, ResourceFragment, ResourceItem } from '#/resource';

import { defineStore } from 'pinia';

import { store } from '@/store';
import { tabsData } from '@/views/resource/routes';

interface ResourceState {
  tabs: ResourceTabItem[];
  activeTab: number;
  selectedLib: number;
  selectedFragment: number;
  resource?: ResourceItem;
}

export const useResourceStore = defineStore({
  id: 'app-resource',
  state: (): ResourceState => ({
    tabs: tabsData,
    activeTab: 1,
    selectedLib: 0,
    selectedFragment: 0,
    resource: undefined,
  }),
  getters: {
    resourceLibs(): ResourceLibItem[] {
      return this.tabs[this.activeTab].libs;
    },
    currentLib(): ResourceLibItem {
      return this.resourceLibs[this.selectedLib];
    },
    favoriteList(): ResourceItem[] {
      return this.currentLib.fragments.filter((v) => v.name === '收藏')[0].list;
    },
  },
  actions: {
    updateFragments(data: ResourceFragment[]) {
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

    setResource(resource: ResourceItem | undefined) {
      if (this.resource?.active) this.resource.active = false;
      if (resource && !resource.active) resource.active = true;
      this.resource = resource;
    },
  },
});

export function useResourceStoreWithOut() {
  return useResourceStore(store);
}
