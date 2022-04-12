import type { App } from 'vue';
import type { I18nOptions } from 'vue-i18n';

import { createI18n } from 'vue-i18n';
import { useLocaleStoreWithOut } from '@/store/locales';

export type LocaleType = 'zh_CN' | 'en';

export interface LocaleSetting {
  showPicker: boolean;
  // Current language
  locale: LocaleType;
  // default language
  fallbackLocale: LocaleType;
  // available Locales
  availableLocales: LocaleType[];
}

export let i18n: ReturnType<typeof createI18n>;

export const availableLocales: LocaleType[] = [];
Object.entries(import.meta.glob('/locales/*.y(a)?ml')).forEach(([key, _]) => {
  key = key.split('/')[2].replace(/\.y(a)?ml$/, '');
  availableLocales.push(key as LocaleType);
});

export function setHtmlPageLang(locale: LocaleType) {
  document.querySelector('html')?.setAttribute('lang', locale);
}

export function setAvailableLocales(cb: (availableLocales?: LocaleType[]) => void) {
  cb(availableLocales);
}

async function createI18nOptions(): Promise<I18nOptions> {
  const localeStore = useLocaleStoreWithOut();
  const { locale, fallbackLocale } = localeStore.getLocale;

  const defaultLocal = (await import(/* @vite-ignore */ `/locales/${locale}.yml`)).default || {};
  const messages = { [locale]: defaultLocal };

  setHtmlPageLang(locale as LocaleType);

  return {
    locale,
    messages,
    fallbackLocale,
    availableLocales,
    sync: true,
    legacy: false,
    missingWarn: false,
    silentFallbackWarn: true,
    silentTranslationWarn: true,
  };
}

export async function resetI18n() {
  const options = await createI18nOptions();
  i18n = createI18n(options);
}

export const setupI18n = async (app: App) => {
  await resetI18n();
  app.use(i18n);
};
