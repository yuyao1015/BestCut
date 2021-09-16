import type { Plugin } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import { configHtmlPlugin } from './html';
import { configHmrPlugin } from './hmr';

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const vitePlugins: (Plugin | Plugin[])[] = [
    //
    vue(),
    vueJsx(),
  ];

  !isBuild && vitePlugins.push(configHmrPlugin());

  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild));

  return vitePlugins;
}
