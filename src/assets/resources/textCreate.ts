import { ResourceFragment, TextResource } from '@/logic/resource';

export const textCreate: ResourceFragment[] = [
  {
    name: '默认',
    usable: true,
    list: [
      //
      new TextResource({
        name: '默认文本',
        thumbnail: '/media/text.png',
        src: '/media/totoro.gif',
      }),
    ],
  },
];
