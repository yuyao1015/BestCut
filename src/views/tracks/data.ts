import type { AudioTrackItem, TrackItem, VideoTrackItem } from '#/track';

import { FireFilled } from '@ant-design/icons-vue';

export const mainTrack: VideoTrackItem = {
  id: '',
  type: 'video',
  trackName: 'bbb.mp4',
  duration: '00:10:34:17',
  cover: ['cover'],
};

export const audioTrack: AudioTrackItem = {
  id: '',
  type: 'audio',
  trackName: 'bbb.aac',
  duration: '00:10:34:17',
  wave: 'wave',
};

export const txtTrack: TrackItem = {
  id: '',
  type: 'text',
  trackName: '默认文本',
  duration: '03:00',
};
export const spriteTrack: TrackItem = {
  id: '',
  type: 'sprite',
  trackName: '渐渐放大',
  duration: '03:00',
  icon: FireFilled,
};
export const stickerTrack: TrackItem = {
  id: '',
  type: 'sticker',
  trackName: '',
  duration: '03:00',
  sticker: '123',
};

// export const list = [[]];
// export const list = [[mainTrack, mainTrack]];
export const list = [[txtTrack, spriteTrack, stickerTrack, mainTrack, mainTrack, mainTrack]];
