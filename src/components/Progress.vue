<template>
  <Progress :percent="percent" :show-info="false" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { Progress } from 'ant-design-vue';

  export default defineComponent({
    name: '',
    components: {
      Progress,
    },
    props: {
      percent: {
        type: Number,
        default: 0,
      },
    },
    emits: [],
    setup() {
      return {
        //
      };
    },
  });
</script>

<style lang="less" scoped>
  .a {
    //
  }
</style>
