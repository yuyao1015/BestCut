import type { RouteRecordRaw } from 'vue-router';

export const RootRoute: RouteRecordRaw = {
  path: '/',
  name: 'Root',
  component: () => import('@/layouts/index.vue'),
  meta: {
    title: 'Root',
  },
};

export const EditorRoute: RouteRecordRaw = {
  path: '/editor',
  name: 'Editor',
  component: () => import('@/views/Editor.vue'),
  meta: {
    title: 'Editor',
  },
};

export const routes: RouteRecordRaw[] = [RootRoute, EditorRoute];
