const video = (n: number) =>
  new Array(n).fill({
    type: 'video',
    duration: '@time("mm:ss")',
    resourceName: '@word().mp4',
    referenced: true,
  });

const audio = (n: number) =>
  new Array(n).fill({
    type: 'audio',
    duration: '@time("mm:ss")',
    resourceName: '@word().aac',
    referenced: false,
    album: '',
    author: '',
  });

const picture = (n: number) =>
  new Array(n).fill({
    type: 'picture',
    duration: '',
    resourceName: '@word().png',
    referenced: false,
  });

const localLib = {
  url: '/local',
  timeout: 200,
  method: 'get',
  response: () => [
    {
      usable: true,
      list: [...video(2), ...audio(1), ...picture(1)],
    },
  ],
};

const materialLib = {
  url: '/material',
  timeout: 200,
  method: 'get',
  response: () =>
    new Array(6).fill({
      name: 'frag1',
      list: [...video(6)],
    }),
};

export default [
  //
  localLib,
  materialLib,
];
