import type { App } from 'vue';
import { createPinia } from 'pinia';

import { useLocaleStore } from './locales';

const store = createPinia();

export function setupStore(app: App<Element>) {
  app.use(store);
  useLocaleStore().initLocale();
}

export { store };
