<template>
  <div class="resource-box relative rounded-md h-20 w-40">
    <!-- template -->
    <StarFilled
      v-if="favorite"
      :class="[checked ? 'text-yellow-400' : '', 'favorite absolute bottom-1 right-6']"
      @click="onChecked"
    />
    <!-- <StarFilled /> -->
    <PlusCircleFilled v-if="add" :class="['add absolute bottom-1 right-1']" />

    <VerticalAlignBottomOutlined
      v-if="_download && !isLoading"
      class="download absolute bottom-1 right-1"
    />
    <LoadingOutlined v-if="_download && isLoading" class="downloading absolute bottom-1 right-1" />
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import {
    PlusCircleFilled,
    StarFilled,
    VerticalAlignBottomOutlined,
    LoadingOutlined,
  } from '@ant-design/icons-vue';

  export default defineComponent({
    name: 'ResourceBox',
    components: {
      //
      PlusCircleFilled,
      StarFilled,
      VerticalAlignBottomOutlined,
      LoadingOutlined,
    },
    props: {
      usable: {
        type: Boolean,
        default: false,
      },
      add: {
        type: Boolean,
        default: true,
      },
      download: {
        type: Boolean,
        default: true,
      },
      favorite: {
        type: Boolean,
        default: false,
      },
      checked: {
        type: Boolean,
        default: true,
      },
    },
    emits: [],
    setup(props) {
      const _download = computed(() => {
        if (props.add && props.download) return false;
        else return props.download;
      });

      const checked = ref(false);
      const onChecked = () => {
        checked.value = !checked.value;
      };

      const isLoading = ref(false);

      return {
        _download,
        checked,
        isLoading,
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
    // .download {
    //   opacity: 0;
    // }

    // .add-hover {
    //   color: aqua;
    //   opacity: 1;
    // }
  }
</style>
