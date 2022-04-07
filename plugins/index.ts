import type { Plugin } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import Unocss from 'unocss/vite';
import Inspect from 'vite-plugin-inspect';

import { configHtmlPlugin } from './html';
import { configHmrPlugin } from './hmr';
import { configMockPlugin } from './mock';
import { configAutoImportPlugin } from './auto-import';

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const vitePlugins: (Plugin | Plugin[])[] = [
    //
    vue(),
    vueJsx(),

    Unocss(),
  ];

  !isBuild && vitePlugins.push(configHmrPlugin());

  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild));

  vitePlugins.push(configMockPlugin(isBuild));

  vitePlugins.push(configAutoImportPlugin());

  !isBuild && vitePlugins.push(Inspect());

  return vitePlugins;
}
