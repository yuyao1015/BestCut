import type { ResourceFragment, ResourceItem } from '#/resource';

import { PlusCircleFilled } from '@ant-design/icons-vue';

import Resource from '@/views/resource/Resource.vue';
import { useResourceStore } from '@/store/resource';
import { usePlayerStoreWithOut } from '@/store/player';

import { stretchImg } from '@/utils/image';

const loadLocalFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.mp4,.aac,.mp3,.jpg,.png';
  input.onchange = async () => {
    const file = input.files && input.files[0];
    if (!file) return;

    const idx = file.name.lastIndexOf('.');
    const suffix = file.name.slice(idx);
    const src = URL.createObjectURL(file);

    let type = 'video',
      cover = '',
      duration = '03:00';
    if (['.mp4'].includes(suffix)) {
      type = 'video';
      const playerStore = usePlayerStoreWithOut();
      const cfg = await playerStore.parseInfo(src);
      playerStore.stop();
      cover = await stretchImg(cfg.cover, 144, 80);
      duration = cfg.duration;
    } else if (['.aac', '.mp3'].includes(suffix)) {
      type = 'audio';
    } else if (['.jpg', '.jpeg', '.png'].includes(suffix)) {
      type = 'picture';
      cover = await stretchImg(src, 144, 80);
    } else {
      console.log('illegal file type');
      return;
    }

    const resource: ResourceItem = {
      type,
      src,
      cover,
      duration,
      name: file.name,
    };
    useResourceStore().addResource(resource);
  };
  input.click();
};

const getTips = (row1: string, row2: string, offline = false) => [
  <div class="flex items-center justify-center">
    {offline ? <PlusCircleFilled class="mr-0.5" /> : null}
    <div>{row1}</div>
  </div>,

  <div class="desc-color text-xs text-center">{row2}</div>,
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

    let el = (
      <div
        class={[
          'load-local-file rounded-md',
          'flex flex-col items-center justify-center',
          'border border-dotted',
          size,
        ]}
        onClick={loadLocalFile}
      >
        {offline
          ? getTips('导入素材', '视频、音频、图片', true)
          : getTips('暂无收藏', '收藏的文本将会在这里出现')}
      </div>
    );

    if (empty && offline) el = <div class="h-full w-full flex items-center justify-center"> </div>;

    return el;
  };
};

export const resourceList = (
  fragment: ResourceFragment,
  component?: () => JSX.Element,
  offline = false
) => (
  <div class="flex flex-col">
    {fragment.name ? <div class="ml-2">{fragment.name}</div> : null}
    <div class="flex flex-wrap">
      {component ? component() : null}

      {fragment.list.map((resource, j) => (
        <Resource
          key={j}
          class="local-resource-list relative m-2 text-xs"
          offline={offline}
          resource={resource}
          usable={resource.usable ? resource.usable : fragment.usable}
          favorite={resource.favorite ? resource.favorite : fragment.favorite}
          showAdd={resource.showAdd ? resource.showAdd : fragment.showAdd}
          // onEvent={offline ? () => {} : () => {}} // TODO: 添加离线资源
        />
      ))}
    </div>
  </div>
);

type ResourceDescriptor = {
  loc?: string;
  indexes?: number[];
  offline?: boolean;
  component?: (fragment: any) => () => JSX.Element;
};

export const resourceWrapper = (
  resourceDescriptor: ResourceDescriptor = {}
): ((list: ResourceFragment[]) => JSX.Element) => {
  return (list: ResourceFragment[]) => {
    const { loc, offline, indexes = [0] } = resourceDescriptor;

    let cached = () => <div />;
    let empty = false;
    return (
      <div class="h-full m-1">
        <div id="resource-list" class="h-full overflow-y-scroll">
          {list.map((fragment, i) => {
            let ret;
            empty = fragment.list.length === 0;
            if ((!empty && offline) || (empty && !offline)) cached = cachedResource(empty, offline);

            if (indexes.includes(i) && (loc === 'wrap-top' || empty)) {
              ret = resourceList(fragment, cached, offline);
            } else ret = resourceList(fragment);

            if (empty && offline) cached = cachedResource(empty, offline);
            return ret;
          })}

          {empty ? cached() : null}
        </div>
      </div>
    );
  };
};
