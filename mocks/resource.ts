import { ResourceFragment } from './../typings/resource.d';

const video = (n: number) =>
  new Array(n).fill({
    type: 'video',
    duration: '@time("mm:ss")',
    resourceName: '@word().mp4',
    referenced: true,
  });

const audio = (n: number, album = '', author = '') =>
  new Array(n).fill({
    type: 'audio',
    duration: '@time("mm:ss")',
    resourceName: '@word().aac',
    referenced: false,
    album,
    author,
  });

const picture = (n: number) =>
  new Array(n).fill({
    type: 'picture',
    duration: '03:00',
    resourceName: '@word().png',
    referenced: false,
  });

const resourceMsg = (url: string, response: () => ResourceFragment[]) => ({
  url: url,
  timeout: 200,
  method: 'get',
  response,
});

// media
const localLib = resourceMsg('/local', () => [
  {
    usable: true,
    list: [...video(2), ...audio(1), ...picture(1)],
  },
]);

const materialLib = resourceMsg('/material', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    list: [...video(6)],
  })
);

// audio
const musicLib = resourceMsg('/music', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    favorite: true,
    list: [...audio(6, '@word(2,6)', '@word(2,6)')],
  })
);

const soundLib = resourceMsg('/sound', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    favorite: true,
    list: [...audio(6, '@word(2,6)', '@word(2,6)')],
  })
);

const extractLib = resourceMsg('/extract', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    usable: true,
    list: [...audio(6, '@word(2,6)')],
  })
);

const collectionLib = resourceMsg('/collection', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    usable: true,
    list: [...audio(6, '@word(2,6)')],
  })
);

const linkLib = resourceMsg('/link', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    usable: true,
    list: [...audio(6, '@word(2,6)')],
  })
);

// text
const textCreateLib = resourceMsg('/create', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    list: [...video(6)],
  })
);

const textTemplateLib = resourceMsg('/template', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    list: [...video(6)],
  })
);

// sticker
const stickerLib = resourceMsg('/sticker', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    list: [...video(6)],
  })
);

// effect
const effectLib = resourceMsg('/effect', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    list: [...video(6)],
  })
);

// transition
const transitionLib = resourceMsg('/transition', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    list: [...video(6)],
  })
);

// filter
const filterLib = resourceMsg('/filter', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    list: [...video(6)],
  })
);

// adjust
const adjustLib = resourceMsg('/adjust', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    list: [...video(6)],
  })
);

// lut
const lutLib = resourceMsg('/lut', () =>
  new Array(6).fill({
    name: 'frag-@word(2)',
    list: [...video(6)],
  })
);

export default [
  localLib,
  materialLib,

  musicLib,
  soundLib,
  extractLib,
  collectionLib,
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
