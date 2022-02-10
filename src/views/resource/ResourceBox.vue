<template>
  <div
    :class="[
      'resource-box relative rounded-md overflow-hidden',
      'w-full h-full',
      resource.active ? 'active-border' : '',
    ]"
    ref="resourceRef"
    @click="play"
  >
    <div
      v-if="resource.active"
      class="timeline-locator absolute rounded-md h-full w-px bg-yellow-500 top-0 z-10"
      :style="{ left: `${ratio}%` }"
    ></div>

    <div class="resource-content overflow-hidden absolute h-full w-full">
      <div v-if="resource instanceof AudioResource" class="h-full flex items-center">
        <img class="rounded-md h-5/6 w-2/5 ml-2 mr-1" draggable="false" :src="resource.thumbnail" />

        <div class="text-xs flex flex-col justify-between h-5/6">
          <div>
            <div style="color: #999">{{ resource.album }}</div>
            <div style="color: #474747">{{ resource.author }}</div>
          </div>
          <div v-if="resource.album && resource.author" style="color: #474747">
            {{ resource.duration }}
          </div>
        </div>
      </div>

      <div
        v-else
        class="h-full w-full rounded-md"
        @pointerover="onPointerOver"
        @pointerleave="onPointerLeave"
      >
        <img
          class="h-full w-full"
          draggable="false"
          :src="isOver && !(resource instanceof VideoResource) ? resource.src : resource.thumbnail"
        />
      </div>
    </div>

    <!-- tl referenced -->
    <div
      v-if="referenced && offline"
      class="absolute top-1 left-1"
      style="background-color: rgb(255, 255, 255, 0.3)"
    >
      <div>已添加</div>
    </div>

    <div class="absolute top-1 right-1">
      <FileImageOutlined v-if="resource instanceof PictureResource" />
      <div
        v-if="
          resource instanceof VideoResource ||
          (resource instanceof AudioResource && !resource.album && !resource.author)
        "
      >
        {{ resource.duration }}
      </div>
    </div>

    <!-- br icons  -->
    <StarFilled
      v-if="favorite"
      :class="[resource.checked ? 'text-yellow-400' : '', 'favorite absolute bottom-1 right-5']"
      @click.stop="onChecked"
    />

    <PlusCircleFilled
      v-if="usable"
      :class="[showAdd ? '' : 'hidden', 'absolute bottom-1 right-1 add']"
      @click.stop="add2Track"
    />

    <DownloadOutlined v-if="!usable && !isLoading" class="download absolute bottom-1 right-1" />
    <LoadingOutlined v-if="!usable && isLoading" class="downloading absolute bottom-1 right-1" />
  </div>
</template>
<script lang="ts" setup>
import { ResourceItem, AudioResource, VideoResource, PictureResource } from '@/logic/resource';

import { PropType, ref, watch, computed } from 'vue';
import {
  PlusCircleFilled,
  DownloadOutlined,
  LoadingOutlined,
  FileImageOutlined,
  StarFilled,
  // StarOutlined,
} from '@ant-design/icons-vue';

import { useResourceStore } from '@/store/resource';
import { usePreviewStore } from '@/store/preview';
import { useTrackStore } from '@/store/track';

import { CanvasId } from '@/settings/playerSetting';
import _ from 'lodash-es';

const props = defineProps({
  usable: {
    type: Boolean,
    default: false,
  },
  showAdd: {
    type: Boolean,
    default: false,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  referenced: {
    type: Boolean,
    default: false,
  },
  offline: {
    type: Boolean,
    default: false,
  },
  resource: {
    type: Object as PropType<ResourceItem>,
    default: {},
  },
});

const checked = ref(props.resource.checked);
const usable = ref(props.usable);
// const isMask = computed(() => Boolean(useAttrs().draggable));

const resourceStore = useResourceStore();
const previewStore = usePreviewStore();
const ratio = computed(() => previewStore.ratio);

const onChecked = () => {
  checked.value = !checked.value;
  checked.value
    ? resourceStore.addFavorite(props.resource)
    : resourceStore.removeFavorite(props.resource);
};
watch(
  () => props.resource.checked,
  () => {
    checked.value = props.resource.checked;
  }
);
watch(
  () => props.resource.usable,
  () => {
    usable.value = props.resource.usable;
  }
);

const trackStore = useTrackStore();
const add2Track = () => {
  const track = props.resource.toTrack();
  if (trackStore.calcWidth) track.width = trackStore.calcWidth(track);
  trackStore.addTrack(track);
};

const isLoading = ref(false);
const resourceRef = ref<HTMLElement | null>(null);
const play = (e: MouseEvent) => {
  const fn = (e: MouseEvent) => {
    resourceStore.setResource(props.resource);
    if (usable.value) {
      if (previewStore.player.active && previewStore.player.id === CanvasId) {
        if (!resourceRef.value) return;
        const left = resourceRef.value?.getBoundingClientRect().left || 0;
        const width = parseInt(getComputedStyle(resourceRef.value).width);
        const w = e.pageX - left - scrollX;
        const ratio = w / width;
        previewStore.jumpTo(ratio);
      } else previewStore.mount({ id: CanvasId, url: props.resource.src || '' });
      return;
    } else {
      isLoading.value = true;
      const download = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('success');
          reject('error');
        }, 500);
      });
      download
        .then((res) => {
          console.log(res);
          usable.value = true;
          resourceStore.download(props.resource);
          play(e);
        })
        .catch((err) => {
          resourceStore.setResource(undefined);
          console.log(err);
        })
        .then(() => {
          isLoading.value = false;
        });
    }
  };
  _.debounce(fn, 300)(e);
};

const isOver = ref(false);
const onPointerOver = () => {
  isOver.value = true;
};
const onPointerLeave = () => {
  isOver.value = false;
};
</script>

<style lang="less" scoped>
.resource-box {
  background-color: #070709;
}

.resource-box:hover {
  .add {
    color: aqua;
    display: block;
  }
}

.active-border {
  border: solid 2px aqua;
}
</style>
