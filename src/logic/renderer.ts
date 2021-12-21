import { ResourceType } from '@/enums/resource';
import * as THREE from 'three';

import { Attachment } from './track-manager';

const FRUSTUM = 0.5;

export class Renderer {
  scene = new THREE.Scene();
  frustum = FRUSTUM;
  camera = new THREE.OrthographicCamera();
  geom = new THREE.PlaneGeometry(1, 1);
  plane = new THREE.Mesh();

  buffer: THREE.WebGLRenderTarget | null = null;
  _renderer: THREE.WebGLRenderer;

  constructor(public canvas: HTMLCanvasElement) {
    this._renderer = new THREE.WebGLRenderer({ canvas });
    this._renderer.setClearColor(new THREE.Color(0x000000), 1.0);
    this._renderer.shadowMap.enabled = true;

    this.setSize(canvas.width, canvas.height);
    this.scene.add(this.plane);
  }

  setSize(width: number, height: number) {
    this._renderer.setSize(width, height);

    this.camera = new THREE.OrthographicCamera(-FRUSTUM, FRUSTUM, FRUSTUM, -FRUSTUM, 0, 1);

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

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

    this.buffer = new THREE.WebGLRenderTarget(
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

    if (!attachments.length) this._renderer.render(this.scene, this.camera);
    else {
      this.attach(attachments, idx);
    }
  }

  attach(attachments: Attachment[], idx: number) {
    let attached = false;
    for (const attachment of attachments) {
      const { startFrame, endFrame, track } = attachment;
      if (track.type === ResourceType.Text || idx < startFrame || idx > endFrame) continue;
      attached = true;

      this._renderer.setRenderTarget(this.buffer);
      this.render(this.scene, this.camera, false);
      const fn = track?.fn.bind(this);
      fn(idx, startFrame, endFrame, this.buffer);
    }

    if (!attached) this.render(this.scene, this.camera);
  }

  render(obj: THREE.Scene | THREE.Object3D, camera: THREE.Camera, renderToScreen = true) {
    if (renderToScreen) this._renderer.setRenderTarget(null);
    this._renderer.render(obj, camera);
  }

  clear() {
    this._renderer.clear();
  }
}
THREE.Clock;
