import type { LocaleSetting, LocaleType } from '#/config';

export const LOCALE: { [key: string]: LocaleType } = {
  ZH_CN: 'zh_CN',
  EN_US: 'en',
};

export const localeSetting: LocaleSetting = {
  showPicker: true,
  // Locale
  locale: LOCALE.ZH_CN,
  // Default locale
  fallback: LOCALE.ZH_CN,
  // available Locales
  availableLocales: Object.values(LOCALE),
};

// locale list
export const localeList: any[] = [
  {
    text: '中',
    event: LOCALE.ZH_CN,
  },
  {
    text: 'En',
    event: LOCALE.EN_US,
  },
];
