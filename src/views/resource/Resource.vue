<template>
  <div class="resource-box-wrapper">
    <div
      :class="[
        'resource-box relative rounded-md overflow-hidden',
        size === '' ? 'h-20 w-36' : 'h-14 w-28',
        resource.active ? 'active-border' : '',
      ]"
      ref="resourceItem"
      @click="play"
      v-click-outside:[preview]="onClickOutside"
    >
      <div
        v-if="resource.active"
        class="timeline-locator absolute rounded-md h-full w-px bg-yellow-300 top-0 z-10"
        :style="{ left: `${ratio}%` }"
      />

      <div class="resource-content overflow-hidden absolute h-full w-full">
        <div v-if="resource.type === 'audio'" class="h-full flex items-center">
          <img class="rounded-md h-5/6 w-2/5 ml-2 mr-1" :src="resource.cover" />
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
        <img v-else class="h-full w-full rounded-md" :src="resource.cover" />
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
        <FileImageOutlined v-if="resource.type === 'picture'" />
        <div
          v-if="
            resource.type === 'video' ||
            (resource.type === 'audio' && !resource.album && !resource.author)
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
      />

      <DownloadOutlined v-if="!usable && !isLoading" class="download absolute bottom-1 right-1" />
      <LoadingOutlined v-if="!usable && isLoading" class="downloading absolute bottom-1 right-1" />
    </div>

    <div v-if="resource.resourceName" class="desc-color text-left text-xs ml-2 mt-1 h-4">
      {{ resource.resourceName }}
    </div>
  </div>
</template>
<script lang="ts">
  import type { ResourceItem } from '#/resource';

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
  import { usePlayerStore } from '@/store/player';

  import { ClickOutside } from '@/directives';

  export default defineComponent({
    name: 'Resource',
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
      size: {
        type: String,
        default: '',
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
      const playerStore = usePlayerStore();
      const ratio = computed(() => playerStore.ratio);

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

      const isLoading = ref(false);
      const resourceItem = ref<HTMLElement>();
      const play = (e: MouseEvent) => {
        resourceStore.setResource(props.resource);
        if (usable.value) {
          const id = 'preview-canvas';
          console.log(playerStore.playing, playerStore.player.id);
          if (playerStore.playing && playerStore.player.id === id) {
            if (!resourceItem.value) return;
            const left = resourceItem.value?.getBoundingClientRect().left || 0;
            const width = parseInt(getComputedStyle(resourceItem.value).width);
            const w = e.pageX - left - scrollX;
            const ratio = w / width;
            playerStore.jumpTo(ratio);
          } else playerStore.mount({ id, url: props.resource.src || '' });
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

      const preview = ref<HTMLElement>();
      onBeforeMount(() => {
        if (!preview.value) preview.value = document.getElementById('preview-box') as HTMLElement;
      });
      const onClickOutside = () => {
        if (active.value) playerStore.player.stop();
        if (resourceStore.resource) resourceStore.setResource(undefined);
      };

      return {
        usable,
        isLoading,
        ratio,
        active,
        preview,
        resourceItem,
        play,
        onClickOutside,
        onChecked,
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
