const MATRIX: number[] = [1, 0, 0, 1, 0, 0];
const INV_MATRIX: number[] = [1, 0, 0, 1, 0, 0];
const SCALE_RATIO = 1.02;
import { MouseCtl } from './mouse';

function drawCropShadow(ctx: CanvasRenderingContext2D, p1: number[], p2: number[]) {
  const { canvas } = ctx;
  const { scrollWidth: w, scrollHeight: h } = canvas;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  // ctx.fillRect(p1[0], p1[1], p2[0]-p1[0], p2[1]-p1[1]);
  ctx.fillRect(0, 0, w, p1[1]); // top
  ctx.fillRect(0, p1[1], p1[0], p2[1] - p1[1]); // left
  ctx.fillRect(p2[0], p1[1], w - p2[0], p2[1] - p1[1]); // right
  ctx.fillRect(0, p2[1], w, h - p2[1]); // bottom
}

export class CanvasImgCtl {
  private mat = MATRIX; // alias
  private im = INV_MATRIX; // alias
  public scale = 1; // current scale
  private rotate = 0;
  private ratio = 16 / 9;
  private scaleBound = [1, 3];
  public pos = { x: 0, y: 0 };
  public mouse: MouseCtl;
  private dirty = true;

  public h = 0;
  public w = 0;
  public p0 = [0, 0];
  public p1 = [0, 0];
  public p2 = [0, 0];
  private image: HTMLImageElement;
  public ctx: CanvasRenderingContext2D;

  constructor(ctx: HTMLCanvasElement | CanvasRenderingContext2D, image: HTMLImageElement) {
    this.image = image;
    if ('canvas' in ctx) this.ctx = ctx;
    else this.ctx = ctx.getContext('2d') as CanvasRenderingContext2D;

    this.mouse = new MouseCtl(this.ctx.canvas);
    this.initMouseCallback();
    this.display();
  }
  initMouseCallback() {
    const self = this;
    this.mouse.zoomInCallback = function (this: MouseCtl) {
      this.w -= 10;
      self.scaleAt(this.x, this.y, SCALE_RATIO);
    };
    this.mouse.zoomOutCallback = function (this: MouseCtl) {
      this.w += 10;
      self.scaleAt(this.x, this.y, 1 / SCALE_RATIO);
    };
    this.mouse.moveCallback = function (this: MouseCtl) {
      const dx = this.x - this.lastX;
      const dy = this.y - this.lastY;
      this.lastX = this.x;
      this.lastY = this.y;
      self.movePos(dx, dy);
    };
  }
  initImage(ratio: number) {
    let { naturalWidth: w, naturalHeight: h } = this.image;
    const { width, height } = this.ctx.canvas;

    if (w / h > ratio) {
      const H = h * (width / w);
      [w, h] = [width, H];
      this.p0 = [0, (height - H) / 2];
    } else if (w / h < ratio) {
      const W = w * (height / h);
      [w, h] = [W, height];
      this.p0 = [(width - W) / 2, 0];
    } else if (w / h - ratio < 1e-15) {
      [w, h] = [width, height];
    }
    this.w = w;
    this.h = h;
  }
  display() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.globalAlpha = 1;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (this.image.complete) {
      if (!this.w || !this.h) this.initImage(this.ratio);
      if (this.dirty) this.update();
      const { mat } = this;
      this.ctx.setTransform(mat[0], mat[1], mat[2], mat[3], mat[4], mat[5]);
      // this.ctx.setTransform(...this.mat);

      this.ctx.drawImage(this.image, this.p0[0], this.p0[1], this.w, this.h);

      drawCropShadow(
        this.ctx,
        this.p1.map((x) => x / this.scale),
        this.p2.map((x) => x / this.scale)
      );
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      this.ctx.font = '28px PingFang SC';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Loading Image...', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
    }
    requestAnimationFrame(() => this.display());
  }
  update() {
    const xdx = Math.cos(this.rotate) * this.scale;
    const xdy = Math.sin(this.rotate) * this.scale; // xdy === 0
    // calculate the inverse transformation
    const cross = xdx * xdx + xdy * xdy;

    this.mat[0] = xdx;
    this.mat[1] = xdy;
    this.mat[2] = -xdy;
    this.mat[3] = xdx;
    this.mat[4] = this.pos.x;
    this.mat[5] = this.pos.y;
    this.im[0] = this.mat[3] / cross;
    this.im[1] = -this.mat[1] / cross;
    this.im[2] = -this.mat[2] / cross;
    this.im[3] = this.mat[0] / cross;
    this.dirty = false;
  }
  toWorld(x: number, y: number, point = {}) {
    if (this.dirty) this.update();

    const xx = x - MATRIX[4];
    const yy = y - MATRIX[5];
    Object.assign(point, {
      x: xx * this.im[0] + yy * this.im[2],
      y: xx * this.im[1] + yy * this.im[3],
    });
    return point;
  }
  toScreen(x: number, y: number, point = {}) {
    if (this.dirty) this.update();

    Object.assign(point, {
      x: x * this.mat[0] + y * this.mat[2] + this.mat[4],
      y: x * this.mat[1] + y * this.mat[3] + this.mat[5],
    });
    return point;
  }
  movePos(x: number, y: number) {
    this.pos.x += x;
    this.pos.y += y;
    this.p1 = [this.p1[0] - x, this.p1[1] - y];
    this.p2 = [this.p2[0] - x, this.p2[1] - y];
    this.dirty = true;
  }
  setPos(x: number, y: number) {
    this.pos.x = x;
    this.pos.y = y;
    this.dirty = true;
  }
  setRect(p1: number[], p2: number[]) {
    this.p1 = [p1[0] - this.pos.x, p1[1] - this.pos.y];
    this.p2 = [p2[0] - this.pos.x, p2[1] - this.pos.y];
  }
  setScale(sc: number) {
    this.scale = sc;
    this.dirty = true;
  }
  scaleScale(sc: number) {
    this.scale *= sc;
    this.dirty = true;
  }
  scaleAt(x: number, y: number, sc: number) {
    if (this.dirty) this.update();
    // this.scale *= sc;
    const _scale = this.scale * sc;
    if (_scale > this.scaleBound[1]) {
      this.setScale(this.scaleBound[1]);
    } else if (_scale < this.scaleBound[0]) {
      this.setScale(this.scaleBound[0]);
      this.movePos(-this.pos.x, -this.pos.y);
    } else {
      this.scaleScale(sc);
      return;
      const dx = (x - this.pos.x) * (sc - 1);
      const dy = (y - this.pos.y) * (sc - 1);
      this.movePos(dx, dy);
    }
  }
}
