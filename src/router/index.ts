import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { createRouter, createWebHashHistory } from 'vue-router';
import { RootRoute } from './routes';

const routes: RouteRecordRaw[] = [
  //
  RootRoute,
];

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH as string | undefined),
  routes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export function setupRouter(app: App<Element>) {
  app.use(router);
}
