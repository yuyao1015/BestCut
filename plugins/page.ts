import type { Plugin } from 'vite';

import Pages from 'vite-plugin-pages';

export function configPagePlugin(): Plugin {
  return Pages({
    dirs: 'src/views',
    extensions: ['vue', 'md'],
  });
}
