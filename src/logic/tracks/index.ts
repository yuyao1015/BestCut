import { toRaw } from 'vue';
import { v4 as uuid } from 'uuid';
import { FireFilled, FilterOutlined } from '@ant-design/icons-vue';
import * as THREE from 'three';
import GLTransitions from 'gl-transitions';
import { parseGIF, decompressFrames, ParsedFrame, ParsedGif } from 'gifuct-js';
import axios from 'axios';

import { Base } from '@/logic/data';
import { MP4Source } from '@/logic/mp4';
import { Renderer, AttachmentParams } from '@/logic/renderer';
import GifUtil from '@/logic/gif';

import { ResourceType } from '@/enums/resource';

type ItemOptional = {
  id: string;
  name: string;
  boxSize: string;

  active: boolean;
  usable: boolean;

  offset: number;
  height: number;
};

type ItemRequired = {
  type: ResourceType;
  duration: string;
};

export type TrackOption = Partial<ItemOptional> & ItemRequired;

type Shader = {
  name: string;
  uniforms: {
    [prop: string]: any;
  };
  vertexShader: string;
  fragmentShader: string;
};

const _geometry = new THREE.BufferGeometry();
_geometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)
);
_geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
const _camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export class TrackItem extends Base {
  type: ResourceType;
  duration: string;

  active = false;
  offset = 0; // second  convert to marginLeft
  width = 0; // pixel    calculated by (duration + offset)
  height = 0; // pixel
  marginLeft = 0; // pixel
  marginRight = 0; // pixel

  constructor(options: TrackOption) {
    super(options.name, options.id);
    this.type = options.type;
    this.duration = options.duration;
    this.offset = options.offset || 0;
    this.height = options.height || 0;
  }

  getProps(): any {
    return undefined;
  }

  clone() {
    const clone = new (this.constructor as Constructor<TrackItem>)(this);
    Object.assign(clone, this);
    clone.id = uuid();
    return clone;
  }
}

export class MediaTrack extends TrackItem {
  refer?: { from: number; to: number };
  src?: string;
  transition?: TransitionTrack;
}

export class VideoTrack extends MediaTrack {
  audio?: AudioTrack;

  thumbnail?: string[];

  constructor(
    options: Omit<TrackOption, 'type'> & {
      src?: string;
      audio?: AudioTrack;
      transition?: TransitionTrack;
      thumbnail?: string[];
    }
  ) {
    super(Object.assign({ height: 84 }, options, { type: ResourceType.Video }));
    this.src = options.src || '';
    this.thumbnail = options.thumbnail;
    this.audio = options.audio;
    this.transition = options.transition;
  }

  getProps() {
    let source;
    if (this.src) source = new MP4Source(this.src);
    return { source };
  }
}

export class AudioTrack extends MediaTrack {
  wave?: string;
  muted?: boolean;
  constructor(options: Omit<TrackOption, 'type'> & { src: string; wave?: string }) {
    super(Object.assign({ height: 60 }, options, { type: ResourceType.Audio }));
    this.src = options.src;
    this.wave = options.wave;
  }
}

export class AttachmentTrack extends TrackItem {
  fn: (
    renderer: Renderer,
    args: AttachmentParams,
    buffer1: THREE.WebGLRenderTarget | null,
    buffer2: THREE.WebGLRenderTarget | null
  ) => void = function () {};
  shader?: Shader;
}

export class StickerTrack extends AttachmentTrack {
  src: string;
  sticker: string;
  x = 0.5;
  y = 0.5;
  scale = 1;
  rotate = 0;
  frames: ParsedFrame[] = [];
  gif?: ParsedGif;

  frameImageData?: ImageData;
  constructor(options: Omit<TrackOption, 'type'> & { src: string; sticker: string }) {
    super(Object.assign({ height: 20 }, options, { type: ResourceType.Sticker }));
    this.src = options.src;
    this.sticker = options.sticker;
  }

  parse() {
    try {
      if (!this.frames.length || !this.gif) {
        axios.get(this.src, { responseType: 'arraybuffer' }).then((res) => {
          this.gif = parseGIF(res.data);
          this.frames = decompressFrames(this.gif, true);
        });
      }
    } catch {
      return false;
    }
    return true;
  }

  getProps() {
    const { gif, frames, x, y, scale, rotate } = this;
    if (!frames.length || !gif) this.parse();
    return { gif, frames, x, y, scale, rotate };
  }

  getImageData(canvas: HTMLCanvasElement, idx: number) {
    const { frames } = this.getProps();

    if (frames[idx].disposalType === 2) {
      GifUtil.clearRect(canvas.width, canvas.height);
    }
    GifUtil.setSize(frames[0]);

    return GifUtil.drawPatch(frames[idx]);
  }
}

export class FilterTrack extends AttachmentTrack {
  icon: any;
  shader = {
    name: 'GrayShader',
    uniforms: {
      tDiffuse: {
        value: {},
      },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 cTextureScreen = texture2D( tDiffuse, vUv );
      vec3 cResult = vec3( cTextureScreen.r * 0.3 + cTextureScreen.g * 0.59 + cTextureScreen.b * 0.11 );
      gl_FragColor =  vec4( cResult, cTextureScreen.a );
    }`,
  };

  constructor(options: Omit<TrackOption, 'type'> & { icon?: any }) {
    super(Object.assign({ height: 20 }, options, { type: ResourceType.Filter }));
    this.icon = options.icon || FilterOutlined;
    this.fn = function (renderer: Renderer, _: AttachmentParams, buffer1: THREE.WebGLRenderTarget) {
      const shader = toRaw(this.shader);
      shader.uniforms.tDiffuse.value = buffer1.texture;
      const material = new THREE.ShaderMaterial({
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
      });
      renderer.plane.material = material;
    };
  }
}

export class EffectTrack extends AttachmentTrack {
  icon: any;

  fn = function (renderer: Renderer, args: AttachmentParams) {
    let { frustum } = renderer;

    const fn = (x: number) => (args.idx === args.endFrame ? x : x * (1 - args.progress));

    frustum = fn(frustum);
    renderer.camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0, 1);
  };

  constructor(options: Omit<TrackOption, 'type'> & { icon?: any }) {
    super(Object.assign({ height: 20 }, options, { type: ResourceType.Effect }));
    this.icon = options.icon || FireFilled;
  }
}

export class TextTrack extends AttachmentTrack {
  x = 0.5;
  y = 0.5;
  size = 30;
  fontFamily = 'SimSun';
  // weight = 'normal';
  // height = 18;
  // bevelThickness = 2;
  // bevelSize = 0.5;
  // bevelEnabled = true;
  // bevelSegments = 3;
  // curveSegments = 12;
  // steps = 1;
  constructor(options: Omit<TrackOption, 'type'>) {
    super(Object.assign({ height: 20 }, options, { type: ResourceType.Text }));
  }
}

const transition = GLTransitions[33];
const { glsl } = transition;
export class TransitionTrack extends AttachmentTrack {
  shader = {
    name: transition.name,
    uniforms: {
      from: {
        value: {},
      },
      to: {
        value: {},
      },
      progress: {
        value: 0.0,
      },
      ratio: {
        value: 16 / 9,
      },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float progress, ratio;
    uniform sampler2D from, to;
    vec4 getFromColor(vec2 vUv){
      return texture2D(from, vUv);
    }
    vec4 getToColor(vec2 vUv){
      return texture2D(to, vUv);
    }
    ${glsl}
    void main(){
      gl_FragColor=transition(vUv);
    }`,
  };

  constructor(options: Omit<TrackOption, 'type'>) {
    super(Object.assign({ height: 84 }, options, { type: ResourceType.Transition }));
    this.fn = (
      renderer: Renderer,
      args: AttachmentParams,
      buffer1: THREE.WebGLRenderTarget,
      buffer2: THREE.WebGLRenderTarget
    ) => {
      const shader = toRaw(this.shader);
      shader.uniforms.from.value = buffer2.texture;
      shader.uniforms.to.value = buffer1.texture;
      shader.uniforms.progress.value = args.progress;
      shader.uniforms.ratio.value = buffer1.width / buffer1.height;
      const material = new THREE.ShaderMaterial({
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
      });

      const mesh = new THREE.Mesh(_geometry, material);
      renderer.render(mesh, _camera);
    };
  }
}

export type TrackMap = {
  video: TrackItem[][];
  main: VideoTrack[];
  audio: AudioTrack[][];
};

export function isMedia(type: ResourceType) {
  return [ResourceType.Video, ResourceType.Audio].includes(type);
}

export function isVideo(type?: ResourceType) {
  return type === ResourceType.Video || type === ResourceType.Picture;
}

export function isAudio(type?: ResourceType) {
  return type === ResourceType.Audio;
}

export function isPicture(type?: ResourceType) {
  return type === ResourceType.Picture;
}
