import { ParsedFrame, ParsedGif } from 'gifuct-js';

// gif patch canvas
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
// full gif canvas
const gifCanvas = document.createElement('canvas');
const gifCtx = gifCanvas.getContext('2d') as CanvasRenderingContext2D;
let frameImageData: ImageData;

export default {
  drawPatch(frame: ParsedFrame) {
    const dims = frame.dims;

    if (
      !frameImageData ||
      dims.width != frameImageData.width ||
      dims.height != frameImageData.height
    ) {
      tempCanvas.width = dims.width;
      tempCanvas.height = dims.height;
      frameImageData = tempCtx.createImageData(dims.width, dims.height);
    }

    // set the patch data as an override
    frameImageData.data.set(frame.patch);

    // draw the patch back over the canvas
    tempCtx.putImageData(frameImageData, 0, 0);

    gifCtx.drawImage(tempCanvas, dims.left, dims.top);
    return gifCanvas;
  },
  clearRect(width: number, height: number) {
    gifCtx.clearRect(0, 0, width, height);
  },
  setSize(frame: ParsedFrame) {
    const { width, height } = frame.dims;
    if (gifCanvas.width !== width || gifCanvas.height !== height) {
      gifCanvas.width = width;
      gifCanvas.height = height;
    }
  },
};
