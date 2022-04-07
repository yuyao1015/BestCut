import type { App } from 'vue';

import { createRouter, createWebHashHistory } from 'vue-router';

import routes from 'virtual:generated-pages';

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH as string | undefined),
  routes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export function setupRouter(app: App<Element>) {
  app.use(router);
}
