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
    tabName: 'media',
    name: t('resource.media'),
    libs: [
      new ResourceLib('local', useResourceWrapper({ loc: 'wrap-top', offline: true })),
      new ResourceLib('mediaMaterial', useResourceWrapper()),
    ],
  },
  {
    icon: h(AudioOutlined),
    tabName: 'audio',
    name: t('resource.audio'),
    libs: [
      new ResourceLib('audioMusic', useResourceWrapper()),
      new ResourceLib('audioSound', useResourceWrapper()),
      new ResourceLib(
        'audioExtract',
        useResourceWrapper({ loc: 'wrap-top', offline: true, indexes: [0, 2] })
      ),
      new ResourceLib('audioLink', useResourceWrapper()),
    ],
  },
  {
    icon: h(FontSizeOutlined),
    tabName: 'text',
    name: t('resource.text'),
    libs: [
      new ResourceLib('textCreate', useResourceWrapper()),
      new ResourceLib('textTemplate', useResourceWrapper()),
    ],
  },
  {
    icon: h(PaperClipOutlined),
    tabName: 'sticker',
    name: t('resource.sticker'),
    libs: [new ResourceLib('stickerMaterial', useResourceWrapper())],
  },
  {
    icon: h(ThunderboltOutlined),
    tabName: 'effect',
    name: t('resource.effect'),
    libs: [new ResourceLib('effectEffect', useResourceWrapper())],
  },
  {
    icon: h(RetweetOutlined),
    tabName: 'transition',
    name: t('resource.transition'),
    libs: [new ResourceLib('transitionEffect', useResourceWrapper())],
  },
  {
    icon: h(FilterOutlined),
    tabName: 'filter',
    name: t('resource.filter'),
    libs: [new ResourceLib('filterLib', useResourceWrapper())],
  },
  {
    icon: h(ForkOutlined),
    tabName: 'adjust',
    name: t('resource.adjust'),
    libs: [
      new ResourceLib('adjust', useResourceWrapper()),
      new ResourceLib('lut', useResourceWrapper({ loc: 'wrap-top' })),
    ],
  },
];
