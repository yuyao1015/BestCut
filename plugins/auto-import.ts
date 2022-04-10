import type { Plugin } from 'vite';

import AutoImport from 'unplugin-auto-import/vite';

export function configAutoImportPlugin(): Plugin {
  return AutoImport({
    include: [
      /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      /\.vue$/,
      /\.vue\?vue/, // .vue
      /\.md$/, // .md
    ],
    imports: [
      'vue',
      'vue-router',
      'vue-i18n',
      'vue/macros',
      // '@vueuse/head',
    ],
    eslintrc: {
      enabled: true,
    },
    exclude: [/dist/],
    dts: 'src/auto-imports.d.ts',
  });
}
