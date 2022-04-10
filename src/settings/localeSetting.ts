import type { LocaleSetting } from '@/modules/i18n';

const locale = 'zh_CN';
const fallbackLocale = 'zh_CN';

export const localeSetting: LocaleSetting = {
  showPicker: true,
  locale,
  fallbackLocale,
  availableLocales: [locale, 'en'],
};
