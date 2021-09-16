import type { LocaleSetting, LocaleType } from '#/config';

import { defineStore } from 'pinia';
import { store } from '@/store';

export const LOCALE_KEY = 'LOCALE__';
import { localeSetting } from '@/locales/localeSetting';

const setting = localStorage.getItem(LOCALE_KEY);
const lsLocaleSetting: LocaleSetting = setting ? JSON.parse(setting) : localeSetting;

interface LocaleState {
  localInfo: LocaleSetting;
}

export const useLocaleStore = defineStore({
  id: 'app-locale',
  state: (): LocaleState => ({
    localInfo: lsLocaleSetting,
  }),
  getters: {
    getShowPicker(): boolean {
      return !!this.localInfo?.showPicker;
    },
    getLocale(): LocaleType {
      return this.localInfo?.locale ?? 'zh_CN';
    },
  },
  actions: {
    setLocaleInfo(info: Partial<LocaleSetting>) {
      this.localInfo = { ...this.localInfo, ...info };
      localStorage.setItem(LOCALE_KEY, JSON.stringify(this.localInfo));
    },

    initLocale() {
      this.setLocaleInfo({
        ...localeSetting,
        ...this.localInfo,
      });
    },
  },
});

export function useLocaleStoreWithOut() {
  return useLocaleStore(store);
}
