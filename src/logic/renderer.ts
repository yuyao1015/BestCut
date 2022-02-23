import * as THREE from 'three';

import { ResourceType } from '@/enums/resource';
import { Attachment } from '@/logic/tracks/manager';

const FRUSTUM = 0.5;

export type AttachmentParams = {
  idx: number;
  startFrame: number;
  endFrame: number;
  offset: number;
  total: number;
  progress: number;
};

export class Renderer {
  scene = new THREE.Scene();
  frustum = FRUSTUM;
  camera = new THREE.OrthographicCamera();
  geom = new THREE.PlaneGeometry(1, 1);
  plane = new THREE.Mesh();

  private _renderer: THREE.WebGLRenderer;
  buffer: THREE.WebGLRenderTarget | null = null;
  buffer1: THREE.WebGLRenderTarget | null = null;
  buffer2: THREE.WebGLRenderTarget | null = null;
  renderToScreen = true;

  constructor(public canvas: HTMLCanvasElement) {
    this._renderer = new THREE.WebGLRenderer({ canvas });
    this._renderer.setClearColor(new THREE.Color(0x000000), 1.0);
    this._renderer.shadowMap.enabled = true;

    this.resetCamera();
    this.setSize(canvas.width, canvas.height);
    this.scene.add(this.plane);
  }

  resetCamera() {
    this.camera = new THREE.OrthographicCamera(-FRUSTUM, FRUSTUM, FRUSTUM, -FRUSTUM, 0, 1);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  setSize(width: number, height: number) {
    this._renderer.setSize(width, height);

    this.geom.parameters.width = width;
    this.geom.parameters.height = height;
    this.plane.geometry = this.geom;

    const size = this._renderer.getSize(new THREE.Vector2());
    const pixelRatio = this._renderer.getPixelRatio();
    const parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    };

    this.buffer = this.buffer1 = new THREE.WebGLRenderTarget(
      size.width * pixelRatio,
      size.height * pixelRatio,
      parameters
    );
    this.buffer2 = new THREE.WebGLRenderTarget(
      size.width * pixelRatio,
      size.height * pixelRatio,
      parameters
    );
  }

  draw(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    attachments: Attachment[],
    idx: number
  ) {
    const material = new THREE.MeshBasicMaterial();
    material.side = THREE.FrontSide;
    material.map = new THREE.Texture(image);
    material.map!.needsUpdate = true;
    this.plane.material = material;

    const attached = this.attach(attachments, idx);
    if (!attached) this.render(this.scene, this.camera);
  }

  attach(attachments: Attachment[], idx: number) {
    let attached = false;
    for (const attachment of attachments) {
      const { startFrame, endFrame, total, offset, track } = attachment;
      if (
        [ResourceType.Sticker, ResourceType.Text].includes(track.type) ||
        idx < startFrame ||
        idx > endFrame
      )
        continue;
      attached = true;

      if (track.shader) this.render(this.scene, this.camera, false);
      const progress = (offset + idx - startFrame) / total;
      const args: AttachmentParams = { idx, startFrame, endFrame, offset, total, progress };
      track.fn(this, args, this.buffer1, this.buffer2);
      if (track.type !== ResourceType.Transition) this.render(this.scene, this.camera);
    }
    return attached;
  }

  render(obj: THREE.Scene | THREE.Object3D, camera: THREE.Camera, renderToScreen = true) {
    if (renderToScreen && this.renderToScreen) this._renderer.setRenderTarget(null);
    else this._renderer.setRenderTarget(this.buffer);
    this._renderer.render(obj, camera);
  }

  clear() {
    this._renderer.clear();
  }
}
