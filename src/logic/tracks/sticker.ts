import axios from 'axios';

import { videoFrame2Url } from '@/utils/player';
import { ResourceType } from '@/enums/resource';
import { AttachmentTrack, TrackOption } from './index';

export class StickerTrack extends AttachmentTrack {
  src: string;
  x = 0.5;
  y = 0.5;
  scale = 1;
  rotate = 0;

  decoder: ImageDecoder;
  chunkSize = 0;

  cover = '';
  frames: VideoFrame[] = [];

  constructor(options: Omit<TrackOption, 'type'> & { src: string }) {
    super(Object.assign({ height: 20 }, options, { type: ResourceType.Sticker }));
    this.src = options.src;

    this.loadFrames();
  }

  loadFrames() {
    axios.get(this.src, { responseType: 'arraybuffer' }).then((res) => {
      this.decoder = new window.ImageDecoder({ data: res.data, type: 'image/gif' });
      let frameIndex = 0;
      const loadFrame = (res: any) => {
        this.frames.push(res.image);
        if (!frameIndex) {
          this.cover = videoFrame2Url(res.image);
          this.chunkSize = this.decoder.tracks.selectedTrack.frameCount;
        }
        if (++frameIndex < this.chunkSize) this.decoder.decode({ frameIndex }).then(loadFrame);
      };
      this.decoder.decode({ frameIndex }).then(loadFrame);
    });
  }

  getProps() {
    const { x, y, scale, rotate, chunkSize } = this;
    if (!this.cover) this.loadFrames();
    return { x, y, scale, rotate, chunkSize };
  }
}
