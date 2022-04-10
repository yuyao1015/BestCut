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

  const viteEnv = wrapperEnv(env);
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
      // terserOptions: {
      //   compress: {
      //     keep_infinity: true,
      //     drop_console: true,
      //   },
      // },
      chunkSizeWarningLimit: 2000,
    },
    server: {
      host: true,
      port: +env.VITE_PORT,
    },

    plugins: createVitePlugins(viteEnv, isBuild),
  };
};

type Recordable<T = any> = Record<string, T>;

export function wrapperEnv(envConf: Recordable): ViteEnv {
  const ret: any = {};

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, '\n');
    realName = realName === 'true' ? true : realName === 'false' ? false : realName;

    if (envName === 'VITE_PORT') {
      realName = Number(realName);
    }
    if (envName === 'VITE_PROXY') {
      try {
        realName = JSON.parse(realName);
      } catch (error) {
        //
      }
    }
    ret[envName] = realName;
    process.env[envName] = realName;
  }
  return ret;
}
