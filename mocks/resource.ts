import type { ResourceFragment } from '@/logic/resource';

const video = (n: number) =>
  new Array(n).fill({
    type: 'video',
    duration: '@time("03:ss")',
    name: '@word().mp4',
    thumbnail: '/media/video.png',
    src: '/media/bbb.mp4',
    referenced: true,
  });

const audio = (n: number, album = '', author = '') =>
  new Array(n).fill({
    type: 'audio',
    duration: '@time("05:ss")',
    name: '@word().aac',
    referenced: false,
    thumbnail: '/media/audio.png',
    src: '/media/bbb.aac',
    album,
    author,
  });

const picture = (n: number) =>
  new Array(n).fill({
    type: 'picture',
    duration: '03:03',
    name: '@word().png',
    thumbnail: '/media/png.png',
    src: '/media/png.png',
    referenced: false,
  });

const text = (n: number) =>
  new Array(n).fill({
    type: 'text',
    duration: '00:03',
    name: '@word()',
    thumbnail: '/media/text.png',
    src: '/media/totoro.gif',
    referenced: false,
  });
const sticker = (n: number) =>
  new Array(n).fill({
    type: 'sticker',
    duration: '00:03',
    name: '@word()',
    thumbnail: '/media/sticker.png',
    src: '/media/totoro.gif',
    referenced: false,
  });
const effect = (n: number) =>
  new Array(n).fill({
    type: 'effect',
    name: '@word()',
    thumbnail: '/media/effect.png',
    src: '/media/totoro.gif',
    referenced: false,
  });
const filter = (n: number) =>
  new Array(n).fill({
    type: 'filter',
    name: '@word()',
    thumbnail: '/media/filter.png',
    src: '/media/totoro.gif',
    referenced: false,
  });
const transition = (n: number) =>
  new Array(n).fill({
    type: 'transition',
    name: '@word()',
    thumbnail: '/media/transition.png',
    src: '/media/totoro.gif',
    referenced: false,
  });

const resourceMsg = (url: string, response: () => { lib: ResourceFragment[]; update: number }) => ({
  url: url,
  timeout: 200,
  method: 'get',
  response,
});

// media
const localLib = resourceMsg('/media/local', () => {
  return {
    lib: [
      {
        usable: true,
        list: [...video(2), ...audio(1), ...picture(1)],
        // list: [],
      },
    ],
    update: 0,
  };
});

const frags = (fn: any, favorite = false, type = 'video', n = 6) => {
  const collections = [
    {
      favorite: true,
      name: type === 'video' ? '收藏' : '收藏',
      showAdd: type === 'video' ? false : true,
      list: [],
    },
  ];
  const arr = new Array(n).fill(
    type === 'video'
      ? {
          name: 'frag-@word(2)',
          list: [...fn(n)],
        }
      : {
          name: 'frag-@word(2)',
          favorite: true,
          showAdd: true,
          list: [...fn(6, '@word(2,6)', '@word(2,6)')],
        }
  );
  const lib = favorite ? collections.concat(arr) : arr;
  return { lib, update: 0 };
};

const materialLib = resourceMsg('/media/mediaMaterial', () => frags(video, true));

// audio
const musicLib = resourceMsg('/audio/audioMusic', () => frags(audio, true, ''));
const soundLib = resourceMsg('/audio/audioSound', () => frags(audio, true, ''));
const extractLib = resourceMsg('/audio/audioExtract', () => {
  return {
    lib: [
      {
        usable: true,
        // list: [...audio(3)],
        list: [],
      },
    ],
    update: 0,
  };
});
const linkLib = resourceMsg('/audio/audioLink', () => frags(audio, true, ''));

// text
const textCreateLib = resourceMsg('/text/textCreate', () => frags(text, true));
const textTemplateLib = resourceMsg('/text/textTemplate', () => frags(text, true));

// sticker
const stickerLib = resourceMsg('/sticker/stickerMaterial', () => frags(sticker, true));

// effect
const effectLib = resourceMsg('/effect/effectEffect', () => frags(effect, false));

// transition
const transitionLib = resourceMsg('/transition/transitionEffect', () => frags(transition, false));

// filter
const filterLib = resourceMsg('/filter/filterLib', () => frags(filter, false));

// adjust
const adjustLib = resourceMsg('/adjust/adjust', () => frags(video, true));

// lut
const lutLib = resourceMsg('/adjust/lut', () => frags(video, false));

export default [
  localLib,
  materialLib,

  musicLib,
  soundLib,
  extractLib,
  linkLib,

  textCreateLib,
  textTemplateLib,

  stickerLib,

  effectLib,

  transitionLib,

  filterLib,

  adjustLib,
  lutLib,
];
