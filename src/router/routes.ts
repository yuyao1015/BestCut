import type { RouteRecordRaw } from 'vue-router';

import { t } from '@/hooks/useI18n';
import { createAsyncComponent } from '@/utils';

export const RootRoute: RouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: '/editor',
  meta: {
    title: 'Root',
  },
};

export const LayoutRoute: RouteRecordRaw = {
  path: '/layout',
  name: 'Layout',
  component: () => import('@/layouts/index.vue'),
  meta: {
    title: t('routes.layout'),
  },
};

export const EditorRoute: RouteRecordRaw = {
  path: '/editor',
  name: 'Editor',
  component: () => import('@/views/Editor.vue'),
  meta: {
    title: t('routes.editor'),
  },
};

export const LoginRoute: RouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: createAsyncComponent(() => import('/@/views/login/Login.vue')),
  meta: {
    title: t('routes.login'),
  },
};

export const routes: RouteRecordRaw[] = [
  //
  RootRoute,
  LayoutRoute,
  EditorRoute,
  LoginRoute,
];
