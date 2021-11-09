import type { AudioTrackItem, TrackItem, VideoTrackItem } from '#/track';

import { FireFilled, FilterOutlined } from '@ant-design/icons-vue';

export const mainList = (name = 'bbb', duration = '00:10:34:17'): VideoTrackItem => ({
  id: '',
  type: 'video',
  trackName: `${name}.mp4`,
  src: '/media/bbb.mp4',
  duration,
  cover: ['cover'],
  width: 200,
  offset: 600,
  start: 0,
  end: 0,
  marginLeft: 200,
  marginRight: 0,
});

export const audioTrack = (): AudioTrackItem => ({
  id: '',
  type: 'audio',
  trackName: 'bbb.aac',
  duration: '00:10:34:17',
  wave: 'wave',
  width: 200,
  offset: 600,
  start: 0,
  end: 0,
  marginLeft: 200,
  marginRight: 0,
});

export const txtTrack = (width = 50, left = 200): TrackItem => ({
  id: '',
  type: 'text',
  trackName: '默认文本',
  duration: '03:00',
  width: width,
  offset: 300,
  start: 0,
  end: 0,
  marginLeft: left,
  marginRight: 0,
});

export const spriteTrack = (): TrackItem => ({
  id: '',
  type: 'sprite',
  trackName: '渐渐放大',
  duration: '03:00',
  icon: FireFilled,
  width: 50,
  offset: 450,
  start: 0,
  end: 0,
  marginLeft: 200,
  marginRight: 0,
});
export const stickerTrack = (): TrackItem => ({
  id: '',
  type: 'sticker',
  trackName: '',
  duration: '03:00',
  sticker: '123',
  width: 50,
  offset: 150,
  start: 0,
  end: 0,
  marginLeft: 200,
  marginRight: 0,
});

export const filterTrack = (): TrackItem => ({
  id: '',
  type: 'filter',
  trackName: '原生',
  duration: '03:00',
  icon: FilterOutlined,
  width: 50,
  offset: 150,
  start: 0,
  end: 0,
  marginLeft: 200,
  marginRight: 0,
});

// export const list = [[]];
// export const list = [[mainTrack(), mainTrack()]];
export const videoList = [
  [filterTrack()],
  [txtTrack(), txtTrack(), txtTrack(), txtTrack()],
  [spriteTrack()],
  [spriteTrack()],
  [stickerTrack()],
  [mainList()],
  [mainList()],
  [mainList()],
];

// export const list = [[mainTrack(), mainTrack(), mainTrack()]];
export const audioList = [[audioTrack()], [audioTrack(), audioTrack(), audioTrack()]];
