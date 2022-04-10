import type { Plugin } from 'vite';

import path from 'path';
import VueI18n from '@intlify/vite-plugin-vue-i18n';

export function configI18nPlugin(_env: ViteEnv, _isBuild: boolean) {
  const i18nPlugin: Plugin = VueI18n({
    runtimeOnly: true,
    compositionOnly: true,
    include: [path.resolve(__dirname, '../locales/**')],
  });
  return i18nPlugin;
}
