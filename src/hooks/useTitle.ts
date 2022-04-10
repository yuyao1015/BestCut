import { useTitle as usePageTitle } from '@vueuse/core';

import { useLocale } from '@/hooks/useLocale';

export function useTitle() {
  const { t } = useLocale();

  const { currentRoute } = useRouter();

  const pageTitle = usePageTitle();

  watch(
    () => currentRoute.value.path,
    () => {
      const route = unref(currentRoute);

      const tTitle = t((route?.meta?.title as string) || '');
      pageTitle.value = tTitle ? ` ${tTitle} - ${t('common.title')} ` : `${t('common.title')}`;
    },
    { immediate: true }
  );
}
