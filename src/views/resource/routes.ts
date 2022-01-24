import { ResourceLib, ResourceTab } from '@/logic/resource/tab';

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

import { resourceWrapper } from '@/views/resource/Resource';

import { useI18n } from '@/hooks/useI18n';
const { t } = useI18n();

export const tabsData: ResourceTab[] = [
  {
    icon: h(PlayCircleOutlined),
    tabName: 'media',
    name: t('resource.media'),
    libs: [
      new ResourceLib('local', resourceWrapper({ loc: 'wrap-top', offline: true })),
      new ResourceLib('mediaMaterial', resourceWrapper()),
    ],
  },
  {
    icon: h(AudioOutlined),
    tabName: 'audio',
    name: t('resource.audio'),
    libs: [
      new ResourceLib('audioMusic', resourceWrapper()),
      new ResourceLib('audioSound', resourceWrapper()),
      new ResourceLib(
        'audioExtract',
        resourceWrapper({ loc: 'wrap-top', offline: true, indexes: [0, 2] })
      ),
      new ResourceLib('audioLink', resourceWrapper()),
    ],
  },
  {
    icon: h(FontSizeOutlined),
    tabName: 'text',
    name: t('resource.text'),
    libs: [
      new ResourceLib('textCreate', resourceWrapper()),
      new ResourceLib('textTemplate', resourceWrapper()),
    ],
  },
  {
    icon: h(PaperClipOutlined),
    tabName: 'sticker',
    name: t('resource.sticker'),
    libs: [new ResourceLib('stickerMaterial', resourceWrapper())],
  },
  {
    icon: h(ThunderboltOutlined),
    tabName: 'effect',
    name: t('resource.effect'),
    libs: [new ResourceLib('effectEffect', resourceWrapper())],
  },
  {
    icon: h(RetweetOutlined),
    tabName: 'transition',
    name: t('resource.transition'),
    libs: [new ResourceLib('transitionEffect', resourceWrapper())],
  },
  {
    icon: h(FilterOutlined),
    tabName: 'filter',
    name: t('resource.filter'),
    libs: [new ResourceLib('filterLib', resourceWrapper())],
  },
  {
    icon: h(ForkOutlined),
    tabName: 'adjust',
    name: t('resource.adjust'),
    libs: [
      new ResourceLib('adjust', resourceWrapper()),
      new ResourceLib('lut', resourceWrapper({ loc: 'wrap-top' })),
    ],
  },
];
