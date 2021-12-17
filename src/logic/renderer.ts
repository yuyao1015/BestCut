import * as THREE from 'three';

export class Renderer {
  scene = new THREE.Scene();
  camera = new THREE.Camera();
  renderer: THREE.WebGLRenderer;
  geom = new THREE.PlaneGeometry(1, 1);

  constructor(public canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setClearColor(new THREE.Color(0x000000), 1.0);

    this.setSize(canvas.width, canvas.height);
  }

  setSize(width: number, height: number) {
    this.renderer.setSize(width, height);

    const frustum = 0.5;
    this.camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0, 1);

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.geom.parameters.width = width;
    this.geom.parameters.height = height;
  }

  draw(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) {
    const material = new THREE.MeshBasicMaterial();
    material.side = THREE.FrontSide;
    material.map = new THREE.Texture(image);

    const plane = new THREE.Mesh(this.geom, material);
    this.scene.add(plane);

    plane.material.map!.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.renderer.clear();
  }
}
