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

// const localResorceJSX = () => (
//   <div class={'load-local-file h-20 w-36 mx-0.5 my-2 rounded-md'} onClick={loadLocalFile}>
//     <div class={'w-full flex items-center justify-center'}>
//       <PlusCircleFilled class="mr-0.5" />
//       <div>导入素材</div>
//     </div>
//     <div class="desc-color text-xs text-center">视频、音频、图片</div>
//   </div>
// );

// export const resourceListJSX = (
//   fragment: ResourceFragment,
//   component?: () => Element | VNode | string
// ) => {
//   return () => (
//     <div class={'flex flex-col'}>
//       {fragment.name ? <div class="">{fragment.name}</div> : ''}

//       <div class={'flex flex-wrap'}>
//         {component ? component() : ''}
//         {fragment.list.forEach((resource, j) => (
//           <Resource
//             key={j}
//             class={'local-resource-list relative mx-0.5 my-2 text-xs'}
//             usable={true}
//             type={resource.type}
//             cover={resource.cover}
//             duration={resource.duration}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export const resourceListWrapperJSX = (list: ResourceFragment[], libName: string = '') => {
//   return () => (
//     <div class={'h-full overflow-y-scroll'}>
//       {list.forEach((fragment, i) => {
//         return i === 0 && libName === 'local'
//           ? resourceListJSX(fragment, localResorceJSX)
//           : resourceListJSX(fragment);
//       })}
//     </div>
//   );
// };

export const LoadLocalResorce = () =>
  h(
    'div',
    {
      class: 'load-local-file h-20 w-36 mx-0.5 my-2 rounded-md',
      onClick: loadLocalFile,
    },
    [
      h('div', { class: 'w-full flex items-center justify-center' }, [
        h(PlusCircleFilled, { class: 'mr-0.5' }),
        h('div', '导入素材'),
      ]),
      h('div', { class: 'desc-color text-xs text-center' }, '视频、音频、图片'),
    ]
  );

export const ResourceList = (fragment: ResourceFragment, component?: () => VNode) =>
  h('div', { class: 'flex flex-col' }, [
    //
    fragment.name ? h('div', fragment.name) : '',
    h('div', { class: 'flex flex-wrap' }, [
      component ? component() : '',
      fragment.list.forEach((resource, j) =>
        h(Resource, {
          key: j,
          class: 'local-resource-list relative mx-0.5 my-2 text-xs',
          type: resource.type,
          cover: resource.cover,
          usable: resource.usable,
          duration: resource.duration,
        })
      ),
    ]),
  ]);

export const resourceListWrapper = (list: ResourceFragment[], libName = '') => {
  return h('div', { class: 'h-full overflow-y-scroll' }, [
    list.forEach((fragment, i) => {
      return i === 0 && libName === 'local'
        ? ResourceList(fragment, LoadLocalResorce)
        : ResourceList(fragment);
    }),
  ]);
};
