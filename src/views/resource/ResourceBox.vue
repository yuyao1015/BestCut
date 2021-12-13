<template>
  <div
    :class="[
      'resource-box relative rounded-md overflow-hidden',
      'w-full h-full',
      resource.active ? 'active-border' : '',
    ]"
    ref="resourceRef"
    @click="play"
    v-click-outside:[exclude]="onClickOutside"
  >
    <div
      v-if="resource.active"
      class="timeline-locator absolute rounded-md h-full w-px bg-yellow-500 top-0 z-10"
      :style="{ left: `${ratio}%` }"
    ></div>

    <div class="resource-content overflow-hidden absolute h-full w-full">
      <div v-if="resource instanceof AudioResource" class="h-full flex items-center">
        <img class="rounded-md h-5/6 w-2/5 ml-2 mr-1" draggable="false" :src="resource.cover" />
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
      <img v-else class="h-full w-full rounded-md" draggable="false" :src="resource.cover" />
    </div>

    <!-- tl referenced -->
    <div
      v-if="referenced && offline"
      class="absolute top-1 left-1"
      style="background-color: rgb(255, 255, 255, 0.3)"
    >
      <div class="">已添加</div>
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
<script lang="ts">
  import { ResourceItem, AudioResource, VideoResource, PictureResource } from '@/logic/resource';

  import { defineComponent, ref, PropType, watch, computed, onBeforeMount } from 'vue';
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

  import { ClickOutside } from '@/directives';
  import { CanvasId } from '@/settings/playerSetting';

  export default defineComponent({
    name: 'ResourceBox',
    components: {
      PlusCircleFilled,
      DownloadOutlined,
      LoadingOutlined,
      FileImageOutlined,
      StarFilled,
      // StarOutlined,
    },
    directives: {
      ClickOutside,
    },
    props: {
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
    },

    emits: ['update:usable', 'update:checked'],
    setup(props, { emit }) {
      const checked = ref(props.resource.checked);
      const active = computed(() => props.resource.active);
      const usable = ref(props.usable);

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

      const trackStore = useTrackStore();
      const add2Track = () => {
        const track = props.resource.toTrack();
        if (trackStore.calcWidth) track.width = trackStore.calcWidth(track).width;
        trackStore.addTrack(track);
      };

      const isLoading = ref(false);
      const resourceRef = ref<HTMLElement | null>(null);
      const play = (e: MouseEvent) => {
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
              emit('update:usable', true);
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

      const exclude = ref<Element[]>([]);
      onBeforeMount(() => {
        if (!exclude.value.length) {
          const preview = document.getElementById('preview-box') as HTMLElement;
          const splitters = document.getElementsByClassName('splitter') as HTMLCollection;
          exclude.value = [preview, ...Array.from(splitters)];
        }
      });

      const onClickOutside = () => {
        if (active.value) previewStore.player.stop();
        if (resourceStore.resource) resourceStore.setResource(undefined);
      };

      return {
        usable,
        isLoading,
        ratio,
        active,
        exclude,
        resourceRef,

        play,
        onClickOutside,
        onChecked,
        add2Track,

        AudioResource,
        VideoResource,
        PictureResource,
      };
    },
  });
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
