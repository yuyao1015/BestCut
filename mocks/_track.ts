import {
  AudioTrack,
  VideoTrack,
  StickerTrack,
  EffectTrack,
  TextTrack,
  FilterTrack,
  TransitionTrack,
} from '@/logic/tracks';

export const videoList = [
  [new FilterTrack({ name: '灰度', duration: '00:04', offset: 1 })],
  [
    new TextTrack({ name: '默认文本1', duration: '02:00', offset: 300 }),
    new TextTrack({ name: '默认文本2', duration: '03:00', offset: 150 }),
    new TextTrack({ name: '默认文本3', duration: '04:00', offset: 400 }),
    new TextTrack({ name: '默认文本4', duration: '01:30', offset: 100 }),
  ],
  [new TextTrack({ name: '默认文本5', duration: '00:05', offset: 1 })],

  [new EffectTrack({ name: '渐渐放大', duration: '00:03', offset: 1 })],
  [new EffectTrack({ name: '渐渐放大', duration: '00:05', offset: 18 })],
  [new StickerTrack({ duration: '00:01', offset: 6, src: '/media/totoro.gif' })],
  [new StickerTrack({ duration: '00:01', offset: 0, src: '/media/totoro.gif' })],

  [new VideoTrack({ name: 'bbb.mp4', duration: '00:10:34:17', src: '/media/bbb.mp4' })],
  [new VideoTrack({ name: 'out.mp4', duration: '00:00:08:03', src: '/media/out.mp4', offset: 20 })],
  [new VideoTrack({ name: 'bbb.mp4', duration: '00:10:34:17', src: '/media/bbb.mp4', offset: 15 })],
];

export const mainList = [
  new VideoTrack({
    name: 'out.mp4',
    duration: '00:00:08:03',
    src: '/media/out.mp4',
    transition: new TransitionTrack({ duration: '00:03' }),
  }),
  new VideoTrack({ name: 'g.mp4', duration: '00:00:46:06', src: '/media/g.mp4' }),
  new VideoTrack({ name: 'ccc.mp4', duration: '00:05:30:20', src: '/media/bbb.mp4' }),
  new VideoTrack({ name: 'ddd.mp4', duration: '00:10:34:17', src: '/media/bbb.mp4' }),
  new VideoTrack({ name: 'eee.mp4', duration: '00:05:30:20', src: '/media/bbb.mp4' }),
  new VideoTrack({ name: 'fff.mp4', duration: '00:10:34:17', src: '/media/bbb.mp4' }),
  new VideoTrack({ name: 'ggg.mp4', duration: '00:05:30:20', src: '/media/bbb.mp4' }),
  new VideoTrack({ name: 'hhh.mp4', duration: '00:10:34:17', src: '/media/bbb.mp4' }),
];

export const audioList = [
  [new AudioTrack({ name: 'aaa.aac', duration: '00:10:34:17', src: '', offset: 200 })],
  [
    new AudioTrack({ name: 'bbb.aac', duration: '00:05:30:20', src: '', offset: 300 }),
    new AudioTrack({ name: 'ccc.aac', duration: '00:10:34:17', src: '', offset: 150 }),
    new AudioTrack({ name: 'ddd.aac', duration: '00:05:30:20', src: '', offset: 100 }),
  ],
];
