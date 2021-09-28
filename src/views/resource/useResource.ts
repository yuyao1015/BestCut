import type { ResourceFragment, ResourceItem } from '#/resource';
import type { VNode } from 'vue';

import { h } from 'vue';
import { PlusCircleFilled } from '@ant-design/icons-vue';

import Resource from '@/views/resource/Resource.vue';
import { useResourceStore } from '@/store/resource';

const loadLocalFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.mp4,.aac,.mp3,.jpg,.png';
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    if (file.name.slice(-4) in ['.mp4']) 'wrong type';
    const resource: ResourceItem = {
      type: 'video',
      src: URL.createObjectURL(file),
      resourceName: file.name,
    };
    useResourceStore().addResource(resource);
  };
  input.click();
};

const getTips = (row1: string, row2: string, offline = false) => [
  h('div', { class: 'flex items-center justify-center' }, [
    offline ? h(PlusCircleFilled, { class: 'mr-0.5' }) : '',
    h('div', row1),
  ]),
  h('div', { class: 'desc-color text-xs text-center' }, row2),
];

export const cachedResource = (empty: boolean, offline = false) => {
  return () => {
    let size;

    if (!empty) {
      size = 'h-20 w-36 m-2';
    } else if (empty && offline) {
      size = 'h-28 w-54 p-8';
    } else if (empty && !offline) {
      size = 'w-full h-20 m-2 bg-gray-200 bg-opacity-10';
    }

    let el = h(
      'div',
      {
        class: [
          'load-local-file rounded-md',
          'flex flex-col item-center justify-center',
          'border border-dotted',
          size,
        ],
        onClick: loadLocalFile,
      },
      offline
        ? getTips('导入素材', '视频、音频、图片', true)
        : getTips('暂无收藏', '收藏的文本将会在这里出现')
    );
    if (empty && offline)
      el = h('div', { class: 'h-full w-full flex items-center justify-center' }, el);

    return el;
  };
};

export const useResourceList = (
  fragment: ResourceFragment,
  component?: () => VNode,
  offline = false
) => {
  return h('div', { class: 'flex flex-col' }, [
    fragment.name ? h('div', { class: 'ml-2' }, fragment.name) : '',
    h('div', { class: 'flex flex-wrap' }, [
      component ? component() : '',

      ...fragment.list.map((resource, j) => {
        return h(Resource, {
          key: j,
          class: 'local-resource-list relative m-2 text-xs',
          offline,
          resource,
          usable: resource.usable ? resource.usable : fragment.usable,
          favorite: resource.favorite ? resource.favorite : fragment.favorite,
          showAdd: resource.showAdd ? resource.showAdd : fragment.showAdd,
          onEvent: offline ? () => {} : () => {}, // TODO: 添加离线资源
        });
      }),
    ]),
  ]);
};

type ResourceDescriptor = {
  loc?: string;
  indexes?: number[];
  offline?: boolean;
  component?: (fragment: any) => () => VNode;
};

export const useResourceWrapper = (
  resourceDescriptor: ResourceDescriptor = {}
): ((list: ResourceFragment[]) => VNode) => {
  return (list: ResourceFragment[]) => {
    const { loc, offline, indexes = [0] } = resourceDescriptor;
    let cached = () => h('div');
    let empty = false;
    return h('div', { class: 'h-full' }, [
      // h('div', { class: 'bg-red-200 text-center w-full' }, 'search'),
      h('div', { id: 'resource-list', class: 'h-full overflow-y-scroll' }, [
        ...list.map((fragment, i) => {
          let ret;
          empty = fragment.list.length === 0;
          if ((!empty && offline) || (empty && !offline)) cached = cachedResource(empty, offline);

          if (indexes.includes(i) && (loc === 'wrap-top' || empty)) {
            ret = useResourceList(fragment, cached, offline);
          } else ret = useResourceList(fragment);

          if (empty && offline) cached = cachedResource(empty, offline);
          return ret;
        }),
        empty ? cached() : '',
      ]),
    ]);
  };
};
