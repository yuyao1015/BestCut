import type { RouteRecordRaw } from 'vue-router';

export const RootRoute: RouteRecordRaw = {
  path: '/',
  name: 'Root',
  component: () => import('@/layouts/index.vue'),
  meta: {
    title: 'Root',
  },
};
