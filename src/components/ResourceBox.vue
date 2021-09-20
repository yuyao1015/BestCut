<template>
  <div class="resource-box relative rounded-md h-20 w-40" @click="display">
    <slot name="content" {Component}>
      {{ 'resource content' }}
    </slot>

    <StarFilled
      v-if="favorite"
      :class="[checked ? 'text-yellow-400' : '', 'favorite absolute bottom-1 right-6']"
      @click="onChecked"
    />

    <PlusCircleFilled
      v-if="usable"
      :class="[showAdd ? '' : 'hidden', 'absolute bottom-1 right-1 add']"
    />

    <DownloadOutlined v-if="!usable && !isLoading" class="download absolute bottom-1 right-1" />
    <LoadingOutlined v-if="!usable && isLoading" class="downloading absolute bottom-1 right-1" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import {
    PlusCircleFilled,
    StarFilled,
    DownloadOutlined,
    LoadingOutlined,
  } from '@ant-design/icons-vue';

  export default defineComponent({
    name: 'ResourceBox',
    components: {
      //
      PlusCircleFilled,
      StarFilled,
      DownloadOutlined,
      LoadingOutlined,
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
        default: true,
      },
      checked: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:usable'],
    setup(props, { emit }) {
      const checked = ref(false);
      const onChecked = () => {
        checked.value = !checked.value;
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

    // .add-hover {
    //   opacity: 0;
    // }
  }

  .resource-box:hover {
    .add {
      color: aqua;
      display: block;
    }
  }
</style>
