import type { Plugin } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import { configHtmlPlugin } from './html';

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const vitePlugins: (Plugin | Plugin[])[] = [
    //
    vue(),
    vueJsx(),
  ];

  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild));

  return vitePlugins;
}
