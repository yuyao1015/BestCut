export * from './axios';

export const noop = () => {};

import { defineAsyncComponent, h } from 'vue';
import { Spin } from 'ant-design-vue';

interface Options {
  size?: 'default' | 'small' | 'large';
  delay?: number;
  timeout?: number;
  loading?: boolean;
  retry?: boolean;
}

export function createAsyncComponent(loader: any, options: Options = {}) {
  const { size = 'small', delay = 100, timeout = 30000, loading = false, retry = true } = options;
  return defineAsyncComponent({
    loader,
    loadingComponent: loading ? h(Spin, { spinning: true, size }) : undefined,
    timeout,
    delay,

    onError: !retry
      ? noop
      : (error, retry, fail, attempts) => {
          if (error.message.match(/fetch/) && attempts <= 3) {
            retry();
          } else {
            fail();
          }
        },
  });
}

export function setDPI(canvas: HTMLCanvasElement, dpi: number) {
  // Set up CSS size.
  canvas.style.width = canvas.style.width || canvas.width + 'px';
  canvas.style.height = canvas.style.height || canvas.height + 'px';

  // Get size information.
  const scaleFactor = dpi / 96;
  const width = parseFloat(canvas.style.width);
  const height = parseFloat(canvas.style.height);

  // Backup the canvas contents.
  const oldScale = canvas.width / width;
  const backupScale = scaleFactor / oldScale;
  const backup: any = canvas.cloneNode(false);
  backup.getContext('2d').drawImage(canvas, 0, 0);

  // Resize the canvas.
  const ctx: any = canvas.getContext('2d');
  canvas.width = Math.ceil(width * scaleFactor);
  canvas.height = Math.ceil(height * scaleFactor);

  // Redraw the canvas image and scale future draws.
  ctx.setTransform(backupScale, 0, 0, backupScale, 0, 0);
  ctx.drawImage(backup, 0, 0);
  ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
}
