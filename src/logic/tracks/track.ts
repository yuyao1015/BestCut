import { v4 as uuid } from 'uuid';
import { FireFilled, FilterOutlined } from '@ant-design/icons-vue';
import * as THREE from 'three';
import GLTransitions from 'gl-transitions';
import { parseGIF, decompressFrames, ParsedFrame, ParsedGif } from 'gifuct-js';
import axios from 'axios';

import { Base } from '@/logic/data';
import { MP4Source } from '@/logic/mp4';
import { Renderer } from '@/logic/renderer';
import GifUtil from '@/logic/gif';

import { ResourceType } from '@/enums/resource';
import { Constructor } from 'three';

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
  fn: any = (x: number) => x;
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
  fn = function (this: Renderer, i: number, s: number, e: number, buffer: any) {
    const GrayShader: Shader = {
      uniforms: {
        tDiffuse: {
          value: null,
        },
        time: {
          value: 0.0,
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
      uniform float time;
      varying vec2 vUv;
      void main() {
        vec4 cTextureScreen = texture2D( tDiffuse, vUv );
        vec3 cResult = vec3( cTextureScreen.r * 0.3 + cTextureScreen.g * 0.59 + cTextureScreen.b * 0.11 );
        gl_FragColor =  vec4( cResult, cTextureScreen.a );
      }`,
    };
    GrayShader.uniforms.tDiffuse.value = buffer.texture;
    GrayShader.uniforms.time.value = i / e;
    const material = new THREE.ShaderMaterial({
      uniforms: GrayShader.uniforms,
      vertexShader: GrayShader.vertexShader,
      fragmentShader: GrayShader.fragmentShader,
    });

    const mesh = new THREE.Mesh(_geometry, material);
    this.render(mesh, _camera);
  };

  constructor(options: Omit<TrackOption, 'type'> & { icon?: any }) {
    super(Object.assign({ height: 20 }, options, { type: ResourceType.Filter }));
    this.icon = options.icon || FilterOutlined;
  }
}

export class EffectTrack extends AttachmentTrack {
  icon: any;

  fn = function (this: Renderer, i: number, s: number, e: number) {
    let { frustum } = this;

    const fn = (x: number) => (i === e ? x : x * (1 - (i - s) / (e - s + 1)));

    frustum = fn(frustum);
    this.camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0, 1);
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

export class TransitionTrack extends AttachmentTrack {
  fn = function (
    this: Renderer,
    i: number,
    s: number,
    e: number,
    buffer1: THREE.WebGLRenderTarget,
    buffer2: THREE.WebGLRenderTarget
  ) {
    const transition = GLTransitions[33];
    const { glsl, name } = transition;
    // console.log(GLTransitions);

    const TransitionShader: Shader = {
      uniforms: {
        from: {
          value: null,
        },
        to: {
          value: null,
        },
        progress: {
          value: 0.0,
        },
        ratio: {
          value: buffer1.width / buffer1.height,
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

    TransitionShader.uniforms.from.value = buffer2.texture;
    TransitionShader.uniforms.to.value = buffer1.texture;
    TransitionShader.uniforms.progress.value = (i - s) / (e - s);
    const material = new THREE.ShaderMaterial({
      uniforms: TransitionShader.uniforms,
      vertexShader: TransitionShader.vertexShader,
      fragmentShader: TransitionShader.fragmentShader,
    });

    const mesh = new THREE.Mesh(_geometry, material);
    this.render(mesh, _camera);
  };
  constructor(options: Omit<TrackOption, 'type'>) {
    super(Object.assign({ height: 84 }, options, { type: ResourceType.Transition }));
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
