import { vue } from '@vitejs/plugin-vue';
import type { ResourceFragment, ResourceLibItem, ResourceTabItem, ResourceItem } from '#/resource';

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

import LocalResource from '@/views/resource/LocalResource.vue';
import { resourceListWrapper, ResourceList } from '@/views/resource/ResourceList';
import ResourceList from '@/views/resource/ResourceList.vue';
// import Resource from '@/components/Resource.vue';

import icon from '@/assets/rhino.jpg';

import { useI18n } from '@/hooks/useI18n';
const { t } = useI18n();

export const localResource: ResourceItem[] = [
  {
    type: 'video',
    duration: '01:02',
    resourceName: 'a.mp4',
    referenced: true,
    cover: icon,
  },
  {
    type: 'audio',
    duration: '03:02',
    resourceName: 'b.aac',
    referenced: false,
    cover: '',
    album: '',
    author: '',
  },
  {
    type: 'picture',
    duration: '',
    resourceName: 'c.png',
    referenced: false,
    cover: '',
  },
];

function fragGen(m: number, n: number): ResourceFragment[] {
  const fragments = [];
  for (let i = 0; i < m; i++) {
    const obj = {} as any;
    obj.name = 'frag_' + i;
    const list = [];
    for (let i = 0; i < n; i++) {
      list.push({
        type: 'video',
        duration: '03:02',
        cover: icon,
      });
    }
    obj.list = list;
    fragments.push(obj);
  }
  return fragments;
}
const lists = fragGen(5, 6);

export const resourceLibs: ResourceLibItem[] = [
  {
    title: t('resource.local'),
    fragments: { list: localResource },
    component: h(LocalResource),
  },
  {
    title: t('resource.material'),
    fragments: lists,
    component: h(ResourceList, { list: lists }),
    // component: resourceListWrapper(lists),
    // component: ResourceList,
  },
];

export const tabsData: ResourceTabItem[] = [
  {
    icon: h(PlayCircleOutlined),
    name: t('resource.media'),
  },
  {
    icon: h(AudioOutlined),
    name: t('resource.audio'),
  },
  {
    icon: h(FontSizeOutlined),
    name: t('resource.text'),
  },
  {
    icon: h(PaperClipOutlined),
    name: t('resource.sticker'),
  },
  {
    icon: h(ThunderboltOutlined),
    name: t('resource.effect'),
  },
  {
    icon: h(RetweetOutlined),
    name: t('resource.transition'),
  },
  {
    icon: h(FilterOutlined),
    name: t('resource.filter'),
  },
  {
    icon: h(ForkOutlined),
    name: t('resource.adjust'),
  },
];
