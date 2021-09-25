import { ResourceFragment } from './../typings/resource.d';

const video = (n: number) =>
  new Array(n).fill({
    type: 'video',
    duration: '@time("mm:ss")',
    resourceName: '@word().mp4',
    cover: '',
    referenced: true,
  });

const audio = (n: number, album = '', author = '') =>
  new Array(n).fill({
    type: 'audio',
    duration: '@time("mm:ss")',
    resourceName: '@word().aac',
    referenced: false,
    cover: '',
    album,
    author,
  });

const picture = (n: number) =>
  new Array(n).fill({
    type: 'picture',
    duration: '03:00',
    resourceName: '@word().png',
    cover: '',
    referenced: false,
  });

const resourceMsg = (url: string, response: () => ResourceFragment[]) => ({
  url: url,
  timeout: 200,
  method: 'get',
  response,
});

// media
const localLib = resourceMsg('/media/local', () => [
  {
    usable: true,
    list: [...video(2), ...audio(1), ...picture(1)],
    // list: [],
  },
]);

const frags = (favorite = false, type = 'video', n = 6) => {
  const collections = [
    {
      favorite: true,
      name: type === 'video' ? '' : '收藏',
      showAdd: type === 'video' ? false : true,
      list: [],
    },
  ];
  const arr = new Array(n).fill(
    type === 'video'
      ? {
          name: 'frag-@word(2)',
          list: [...video(n)],
        }
      : {
          name: 'frag-@word(2)',
          favorite: true,
          showAdd: true,
          list: [...audio(6, '@word(2,6)', '@word(2,6)')],
        }
  );
  return favorite ? collections.concat(arr) : arr;
};

const materialLib = resourceMsg('/media/mediaMaterial', () => frags(true));

// audio
const musicLib = resourceMsg('/audio/audioMusic', () => frags(true, ''));
const soundLib = resourceMsg('/audio/audioSound', () => frags(true, ''));
const extractLib = resourceMsg('/audio/audioExtract', () => frags(true, ''));
const linkLib = resourceMsg('/audio/audioLink', () => frags(true, ''));

// text
const textCreateLib = resourceMsg('/text/textCreate', () => frags(true));
const textTemplateLib = resourceMsg('/text/textTemplate', () => frags(true));

// sticker
const stickerLib = resourceMsg('/sticker/stickerMaterial', () => frags(true));

// effect
const effectLib = resourceMsg('/effect/effectEffect', () => frags(false));

// transition
const transitionLib = resourceMsg('/transition/transitionEffect', () => frags(false));

// filter
const filterLib = resourceMsg('/filter/filterLib', () => frags(false));

// adjust
const adjustLib = resourceMsg('/adjust/adjust', () => frags(true));

// lut
const lutLib = resourceMsg('/adjust/lut', () => frags(false));

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
