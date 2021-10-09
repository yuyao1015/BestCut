export function stretchImg(
  src: any,
  width: number,
  height: number,
  ratio?: number,
  pad = true
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      let { naturalHeight: h, naturalWidth: w } = img;
      const H = h * (width / w);
      const W = w * (height / h);

      if (!ratio) {
        if (w / h >= width / height) [w, h] = [width, H];
        else [w, h] = [W, height];
      } else if (w / h > ratio) {
        [w, h] = [width, H];
      } else if (w / h < ratio) {
        [w, h] = [W, height];
      } else if (w / h - ratio < 1e-15) {
        [w, h] = [width, height];
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = pad ? width : w;
      canvas.height = pad ? height : h;
      pad && ctx?.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
      !pad && ctx?.drawImage(img, 0, 0, w, h);

      resolve(canvas.toDataURL('image/jpeg'));
    };
  });
}
