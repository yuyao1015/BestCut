import type { App } from 'vue';
import { createPinia } from 'pinia';

import { useLocaleStore } from './locales';

export const store = createPinia();

export function setupStore(app: App<Element>) {
  app.use(store);
  useLocaleStore().initLocale();
}
