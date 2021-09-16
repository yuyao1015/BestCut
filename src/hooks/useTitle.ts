import { watch, unref } from 'vue';
import { useTitle as usePageTitle } from '@vueuse/core';

import { useI18n } from '@/hooks/useI18n';
import { useGlobSetting } from '@/hooks/useGlobSetting';
import { useRouter } from 'vue-router';

export function useTitle() {
  const { title } = useGlobSetting();
  const { t } = useI18n();
  const { currentRoute } = useRouter();

  const pageTitle = usePageTitle();

  watch(
    () => currentRoute.value.path,
    () => {
      const route = unref(currentRoute);

      const tTitle = t(route?.meta?.title as string);
      pageTitle.value = tTitle ? ` ${tTitle} - ${title} ` : `${t('common.title')}`;
    },
    { immediate: true }
  );
}
