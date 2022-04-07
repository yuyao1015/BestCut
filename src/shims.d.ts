/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'gl-transitions' {
  type GLTransition = {
    author: string;
    createdAt: string;
    defaultParams: { shadow_colour?: number[]; shadow_height?: number; bounces?: number };
    glsl: string;
    license: string;
    name: string;
    paramsTypes: { shadow_colour?: string; shadow_height?: string; bounces?: number };
    updatedAt: string;
  };

  const GLTransitions: GLTransition[];
  export default GLTransitions;
}
