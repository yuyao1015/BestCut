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

  type MP4Box = any;
  type EncodedVideoChunk = any;
  type VideoDecoder = any;
  type VideoFrame = any;
  type VideoEncoder = any;
  type ImageDecoder = any;
  type AudioDecoder = any;
  type AudioEncoder = any;
  interface Window {
    MP4Box: MP4Box;
    EncodedVideoChunk: EncodedVideoChunk;
    VideoDecoder: VideoDecoder;
    VideoFrame: VideoFrame;
    VideoEncoder: VideoEncoder;
    ImageDecoder: ImageDecoder;
    AudioDecoder: AudioDecoder;
    AudioEncoder: AudioEncoder;

    setTimeout: (callback: any, ms: number) => number;
  }

  type DragView = {
    el?: HTMLElement;
    left: number;
    top: number;
  };

  type FirstArgument<T> = T extends (arg1: infer A, ...args: any[]) => any ? A : never;
  type SecondArgument<T> = T extends (arg1: any, arg2: infer A, ...args: any[]) => any ? A : never;
  type ThirdArgument<T> = T extends (arg1: any, arg2: any, arg3: infer A, ...args: any[]) => any
    ? A
    : never;
  type Not<T> = [T] extends [true] ? false : true;
  type Equal<T1, T2> = T1 extends T2 ? (T2 extends T1 ? true : false) : false;
  type IsNotAny<T> = 0 extends 1 & T ? false : true;
  type IsTypeEqual<T1, T2> = IsNotAny<T1> extends false
    ? false
    : IsNotAny<T2> extends false
    ? false
    : [T1] extends [T2]
    ? [T2] extends [T1]
      ? true
      : false
    : false;
  type ArrayElement<T> = T extends (infer I)[] ? I : never;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
  type XOR<T, U> = T | U extends Record<string, unknown>
    ? (Without<T, U> & U) | (Without<U, T> & T)
    : T | U;

  interface Constructor<T = Record<string, unknown>> {
    new (...args: any[]): T;
    prototype: T;
  }
}
