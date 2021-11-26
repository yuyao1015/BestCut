import type { AudioTrackItem, TrackItem, VideoTrackItem } from '#/track';

import { FireFilled, FilterOutlined } from '@ant-design/icons-vue';

export const mainTrack = (name = 'bbb', duration = '00:10:34:17'): VideoTrackItem => ({
  id: '',
  type: 'video',
  trackName: `${name}.mp4`,
  src: '/media/bbb.mp4',
  duration,
  cover: ['cover'],
  width: 200,
  height: 84,
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
  height: 60,
  offset: 600,
  start: 0,
  end: 0,
  marginLeft: 200,
  marginRight: 0,
});

export const txtTrack = (offset = 200, duration = '03:00'): TrackItem => ({
  id: '',
  type: 'text',
  trackName: '默认文本',
  duration,
  width: 200,
  height: 20,
  offset,
  start: 0,
  end: 0,
  marginLeft: 200,
  marginRight: 0,
});

export const spriteTrack = (): TrackItem => ({
  id: '',
  type: 'sprite',
  trackName: '渐渐放大',
  duration: '03:00',
  icon: FireFilled,
  width: 50,
  height: 20,
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
  height: 20,
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
  height: 20,
  offset: 150,
  start: 0,
  end: 0,
  marginLeft: 200,
  marginRight: 0,
});

export const videoList = [
  [filterTrack()],
  [txtTrack(300, '02:00'), txtTrack(150, '03:00'), txtTrack(400, '04:00'), txtTrack(100, '01:30')],
  [spriteTrack()],
  [spriteTrack()],
  [stickerTrack()],
  [mainTrack()],
  [mainTrack()],
  [mainTrack()],
];

export const mainList = [
  mainTrack('aaa', '00:05:30:20'),
  mainTrack('bbb'),
  mainTrack('ccc', '00:05:30:20'),
  mainTrack('ddd'),
  mainTrack('eee', '00:05:30:20'),
  mainTrack('fff'),
  mainTrack('ggg', '00:05:30:20'),
  mainTrack('hhh'),
];
export const audioList = [[audioTrack()], [audioTrack(), audioTrack(), audioTrack()]];
