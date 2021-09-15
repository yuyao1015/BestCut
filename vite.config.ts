import type { UserConfig, ConfigEnv } from 'vite';

import { loadEnv } from 'vite';
import { resolve } from 'path';

import { createVitePlugins } from './plugins';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const env = loadEnv(mode, root);

  const isBuild = command === 'build';

  return {
    base: env.VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: [
        {
          find: /@\//,
          replacement: `${pathResolve('src')}/`,
        },
        {
          find: /#\//,
          replacement: `${pathResolve('typings')}/`,
        },
      ],
    },
    build: {
      target: 'es2015',
      outDir: './dist',
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: true,
        },
      },
      chunkSizeWarningLimit: 2000,
    },
    server: {
      host: true,
      port: +env.VITE_PORT,
      cors: true,
      proxy: {
        '/login': 'http://localhost:8081',
        '/resume': 'http://localhost:8081',
        '/github': 'http://localhost:8081',
      },
    },

    plugins: createVitePlugins(env.viteEnv, isBuild),
  };
};
