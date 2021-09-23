import type { ResourceLibItem, ResourceTabItem } from '#/resource';

import { h } from 'vue';
import {
  PlayCircleOutlined,
  AudioOutlined,
  FontSizeOutlined,
  PaperClipOutlined,
  ThunderboltOutlined,
  RetweetOutlined,
  FilterOutlined,
  ForkOutlined,
} from '@ant-design/icons-vue';

import { useResourceWrapper } from '@/views/resource/useResource';

import { useI18n } from '@/hooks/useI18n';
const { t } = useI18n();

class ResourceLib implements ResourceLibItem {
  libName = '';
  fragments = [];
  component = useResourceWrapper();
  constructor(libName: string, component: ReturnType<typeof useResourceWrapper>) {
    this.libName = libName;
    this.component = component;
  }
}

export const tabsData: ResourceTabItem[] = [
  {
    icon: h(PlayCircleOutlined),
    name: t('resource.media'),
    libs: [
      new ResourceLib('local', useResourceWrapper('wrap')),
      new ResourceLib('material', useResourceWrapper()),
    ],
  },
  {
    icon: h(AudioOutlined),
    name: t('resource.audio'),
    libs: [
      new ResourceLib('musics', useResourceWrapper()),
      new ResourceLib('soundSffects', useResourceWrapper()),
      new ResourceLib('audioExtract', useResourceWrapper()),
      new ResourceLib('collections', useResourceWrapper()),
      new ResourceLib('audioNetwork', useResourceWrapper()),
    ],
  },
  {
    icon: h(FontSizeOutlined),
    name: t('resource.text'),
    libs: [
      new ResourceLib('newText', useResourceWrapper()),
      new ResourceLib('textTemplate', useResourceWrapper()),
    ],
  },
  {
    icon: h(PaperClipOutlined),
    name: t('resource.sticker'),
    libs: [new ResourceLib('sticker', useResourceWrapper())],
  },
  {
    icon: h(ThunderboltOutlined),
    name: t('resource.effect'),
    libs: [new ResourceLib('effect', useResourceWrapper())],
  },
  {
    icon: h(RetweetOutlined),
    name: t('resource.transition'),
    libs: [new ResourceLib('transition', useResourceWrapper())],
  },
  {
    icon: h(FilterOutlined),
    name: t('resource.filter'),
    libs: [new ResourceLib('filter', useResourceWrapper())],
  },
  {
    icon: h(ForkOutlined),
    name: t('resource.adjust'),
    libs: [
      new ResourceLib('adjust', useResourceWrapper()),
      new ResourceLib('Lut', useResourceWrapper()),
    ],
  },
];
