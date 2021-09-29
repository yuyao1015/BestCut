export {};
declare global {
  interface ViteEnv {
    VITE_PORT: number;
    VITE_USE_MOCK: boolean;
    VITE_USE_PWA: boolean;
    VITE_PUBLIC_PATH: string;
    VITE_PROXY: [string, string][];
    VITE_GLOB_APP_TITLE: string;
    VITE_GLOB_APP_SHORT_NAME: string;
    VITE_USE_CDN: boolean;
    VITE_DROP_CONSOLE: boolean;
    VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'none';
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean;
    VITE_LEGACY: boolean;
    VITE_USE_IMAGEMIN: boolean;
    VITE_GENERATE_UI: string;
  }

  type Recordable<T = any> = Record<string, T>;

  interface Window {
    MP4Box: any;
    EncodedVideoChunk: any;
    VideoDecoder: any;
  }

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
  type XOR<T, U> = T | U extends Record<string, unknown>
    ? (Without<T, U> & U) | (Without<U, T> & T)
    : T | U;

  type Id = { id: string; url?: string };
  type Canvas = { canvas: HTMLCanvasElement; url?: string };
  type MP4PlayerOption = XOR<Id, Canvas>;
}
