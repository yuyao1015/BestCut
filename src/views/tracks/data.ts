import type { AudioTrackItem, TrackItem, VideoTrackItem } from '#/track';

import { FireFilled } from '@ant-design/icons-vue';

export const mainTrack = (): VideoTrackItem => ({
  id: '',
  type: 'video',
  trackName: 'bbb.mp4',
  src: '/media/bbb.mp4',
  duration: '00:10:34:17',
  cover: ['cover'],
  width: 200,
  offset: 20,
  marginLeft: 200,
});

export const audioTrack = (): AudioTrackItem => ({
  id: '',
  type: 'audio',
  trackName: 'bbb.aac',
  duration: '00:10:34:17',
  wave: 'wave',
  width: 200,
  offset: 20,
  marginLeft: 200,
});

export const txtTrack = (): TrackItem => ({
  id: '',
  type: 'text',
  trackName: '默认文本',
  duration: '03:00',
  width: 50,
  offset: 10,
});

export const spriteTrack = (): TrackItem => ({
  id: '',
  type: 'sprite',
  trackName: '渐渐放大',
  duration: '03:00',
  icon: FireFilled,
  width: 50,
  offset: 15,
});
export const stickerTrack = (): TrackItem => ({
  id: '',
  type: 'sticker',
  trackName: '',
  duration: '03:00',
  sticker: '123',
  width: 50,
  offset: 5,
});

// export const list = [[]];
// export const list = [[mainTrack(), mainTrack()]];
export const list = [
  [txtTrack()],
  [spriteTrack()],
  [stickerTrack()],
  [mainTrack()],
  [mainTrack()],
  [mainTrack()],
];

// export const list = [[mainTrack(), mainTrack(), mainTrack()]];
export const audioList = [[audioTrack()], [audioTrack(), audioTrack(), audioTrack()]];
