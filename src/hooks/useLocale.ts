import { LocaleType, i18n, setHtmlPageLang, availableLocales, resetI18n } from '@/modules/i18n';
import { useLocaleStoreWithOut } from '@/store/locales';

export const LOCALE_KEY = 'LOCALE__';

export function useLocale() {
  const localeStore = useLocaleStoreWithOut();
  const locale = computed(() => localeStore.getLocale.locale);
  const getShowLocalePicker = computed(() => localeStore.getShowPicker);

  const getAntdLocale = computed((): any => {
    return i18n.global.getLocaleMessage(unref(locale))?.antdLocale ?? {};
  });

  watch(
    () => i18n,
    async (val) => {
      if (!val) await resetI18n();
    }
  );

  function setI18nLanguage(locale: LocaleType) {
    if (i18n.mode === 'legacy') {
      i18n.global.locale = locale;
    } else {
      (i18n.global.locale as any).value = locale;
    }
    localeStore.setLocaleInfo({ locale });
    setHtmlPageLang(locale);
  }

  // Switching the language will change the locale of useI18n
  // And submit to configuration modification
  async function changeLocale(locale: LocaleType) {
    const globalI18n = i18n.global;
    const currentLocale = unref(globalI18n.locale);
    if (currentLocale === locale) {
      return locale;
    }

    if (availableLocales?.includes(locale)) {
      setI18nLanguage(locale);
      return locale;
    }
    const langModule = (await import(/* @vite-ignore */ `/locales/${locale}.yml`))?.default;
    if (!langModule) return;

    const { message } = langModule;

    globalI18n.setLocaleMessage(locale, message);
    availableLocales?.push(locale);

    setI18nLanguage(locale);
    return locale;
  }

  return {
    locale,
    availableLocales,
    getShowLocalePicker,
    getAntdLocale,

    changeLocale,
    t: i18n?.global?.t || ((s) => s),
  };
}
