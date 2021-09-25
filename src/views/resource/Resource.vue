<template>
  <div class="resource-box-wrapper">
    <div
      :class="[size === '' ? 'h-20 w-36' : 'h-14 w-28', 'resource-box relative rounded-md ']"
      @click="display"
    >
      <div class="resource-content overflow-hidden absolute h-full w-full">
        <div v-if="resource.type === 'audio'" class="h-full flex items-center">
          <img class="rounded-md h-5/6 w-2/5 ml-2 mr-1" :src="resource.cover" />
          <div class="text-xs flex flex-col justify-between h-5/6">
            <div>
              <div style="color: #999">{{ resource.album }}</div>
              <div style="color: #474747">{{ resource.author }}</div>
            </div>
            <div v-if="resource.album && resource.author" style="color: #474747">{{
              resource.duration
            }}</div>
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
        <div v-if="resource.type === 'video' || (!resource.album && !resource.author)" class=""
          >{{ resource.duration }}
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

    <div v-if="resource.resourceName" class="desc-color text-left text-xs ml-2 h-4">
      {{ resource.resourceName }}
    </div>
  </div>
</template>
<script lang="ts">
  import type { ResourceItem } from '#/resource';

  import { defineComponent, ref, PropType } from 'vue';
  import {
    PlusCircleFilled,
    DownloadOutlined,
    LoadingOutlined,
    FileImageOutlined,
    StarFilled,
    // StarOutlined,
  } from '@ant-design/icons-vue';

  import { useResourceStore } from '@/store/resource';

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
      const usable = ref(props.usable);

      const resourceStore = useResourceStore();

      const onChecked = () => {
        checked.value = !checked.value;
        // emit('update:checked', checked.value);

        checked.value
          ? resourceStore.addFavorite(props.resource)
          : resourceStore.removeFavorite(props.resource);
      };

      const isLoading = ref(false);
      const display = () => {
        if (props.usable) {
          // TODO: display
        } else {
          isLoading.value = true;
          // TODO: download
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
            })
            .catch((err) => {
              console.log(err);
            })
            .then(() => {
              isLoading.value = false;
            });
        }
      };

      return {
        usable,
        isLoading,
        display,
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
</style>
