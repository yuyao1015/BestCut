<template>
  <div class="resource-box-wrapper">
    <div
      :class="[size === '' ? 'h-20 w-36' : 'h-14 w-28', 'resource-box relative rounded-md ']"
      @click="display"
    >
      <div class="resource-content overflow-hidden absolute h-full w-full">
        <div v-if="type === 'audio'" class="h-full flex items-center">
          <img class="rounded-md h-5/6 w-2/5 ml-2 mr-1" :src="cover" />
          <div class="text-xs flex flex-col justify-between h-5/6">
            <div>
              <div style="color: #999">{{ album }}</div>
              <div style="color: #474747">{{ author }}</div>
            </div>
            <div v-if="album && author" style="color: #474747">{{ duration }}</div>
          </div>
        </div>
        <img v-else class="h-full w-full rounded-md" :src="cover" />
      </div>

      <!-- tl referenced -->
      <div
        v-if="referenced"
        class="absolute top-1 left-1"
        style="background-color: rgb(255, 255, 255, 0.3)"
      >
        <div class="">已添加</div>
      </div>

      <div class="absolute top-1 right-1">
        <FileImageOutlined v-if="type === 'picture'" />
        <div v-if="type === 'video' || (!album && !author)" class="">{{ duration }} </div>
      </div>

      <!-- br icons  -->
      <StarFilled
        v-if="favorite"
        :class="[checked ? 'text-yellow-400' : '', 'favorite absolute bottom-1 right-5']"
        @click.stop="onChecked"
      />

      <PlusCircleFilled
        v-if="usable"
        :class="[showAdd ? '' : 'hidden', 'absolute bottom-1 right-1 add']"
      />

      <DownloadOutlined v-if="!usable && !isLoading" class="download absolute bottom-1 right-1" />
      <LoadingOutlined v-if="!usable && isLoading" class="downloading absolute bottom-1 right-1" />
    </div>

    <div v-if="resourceName" class="desc-color text-left text-xs ml-2 h-4"> {{ resourceName }}</div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import {
    PlusCircleFilled,
    StarFilled,
    DownloadOutlined,
    LoadingOutlined,
    FileImageOutlined,
  } from '@ant-design/icons-vue';

  export default defineComponent({
    name: 'Resource',
    components: {
      PlusCircleFilled,
      StarFilled,
      DownloadOutlined,
      LoadingOutlined,
      FileImageOutlined,
    },
    props: {
      type: {
        type: String,
        default: '',
      },
      duration: {
        type: String,
        default: '',
      },
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
      checked: {
        type: Boolean,
        default: false,
      },
      resourceName: {
        type: String,
        default: '',
      },
      size: {
        type: String,
        default: '',
      },
      cover: {
        type: String,
        default: '',
      },
      referenced: {
        type: Boolean,
        default: false,
      },
      album: {
        type: String,
        default: '',
      },
      author: {
        type: String,
        default: '',
      },
    },
    emits: ['update:usable', 'update:checked'],
    setup(props, { emit }) {
      const checked = ref(false);
      const usable = ref(props.usable);

      const onChecked = () => {
        checked.value = !checked.value;
        emit('update:checked', checked.value);
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
        checked,
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
