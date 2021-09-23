import type { ResourceFragment } from '#/resource';
import type { VNode } from 'vue';

import { h } from 'vue';
import { PlusCircleFilled } from '@ant-design/icons-vue';

import Resource from '@/components/Resource.vue';

const loadLocalFile = () => {
  const input = document.createElement('input');
  input.accept = '.mp4,.aac,.mp3,.jpg,.png';
  input.onclick = () => {
    console.log('load file');
  };
  input.click();
};

export const LoadLocalResource = (empty: boolean) => {
  return () =>
    h(
      'div',
      {
        class: [
          'load-local-file',
          empty ? 'h-20 w-36 mx-2 my-2' : 'h-28 w-54 mx-auto my-10 p-10 ',
          'rounded-md',
          'flex flex-col item-center justify-center',
          'border border-dotted',
        ],
        onClick: loadLocalFile,
      },
      [
        h('div', { class: 'flex items-center justify-center' }, [
          h(PlusCircleFilled, { class: 'mr-0.5' }),
          h('div', '导入素材'),
        ]),
        h('div', { class: 'desc-color text-xs text-center' }, '视频、音频、图片'),
      ]
    );
};

export const useResourceList = (fragment: ResourceFragment, component?: () => VNode) =>
  h('div', { class: 'flex flex-col' }, [
    fragment.name ? h('div', { class: 'ml-2' }, fragment.name) : '',
    h('div', { class: 'flex flex-wrap' }, [
      component ? component() : '',

      ...fragment.list.map((resource, j) => {
        return h(Resource, {
          key: j,
          class: 'local-resource-list relative mx-2 my-2 text-xs',
          usable: resource.usable ? resource.usable : fragment.usable,
          checked: resource.checked,
          type: resource.type,
          cover: resource.cover,
          duration: resource.duration,
          referenced: resource.referenced,
          resourceName: resource.resourceName,
        });
      }),
    ]),
  ]);

export const useResourceWrapper = (
  loc = ''
  // component: (fragment: ResourceFragment) => () => VNode
): ((list: ResourceFragment[]) => VNode) => {
  return (list: ResourceFragment[]) =>
    h('div', { class: 'h-full overflow-y-scroll' }, [
      ...list.map((fragment, i) => {
        return i === 0 && loc === 'wrap'
          ? useResourceList(fragment, LoadLocalResource(fragment.list.length > 0))
          : useResourceList(fragment);
      }),
    ]);
};
