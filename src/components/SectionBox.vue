<template>
  <div class="function-area-box h-full rounded-md">
    <slot name="header">
      <div class="function-area-header rounded-t-md h-10 flex items-center border-black border-b">
        <div class="function-area-title capitalize ml-3">
          {{ title }}
        </div>
      </div>
    </slot>

    <slot name="content">
      <div class="function-area-content flex items-center justify-center h-90">
        {{ 'content' }}
      </div>
    </slot>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'SectionBox',
    components: {
      //
    },
    props: {
      //
      title: {
        type: String,
        default: 'function area header',
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
<style scoped lang="less">
  .function-area {
    &-box {
      color: #fff;
      background-color: #272728;
    }

    &-header {
      background-color: #414145;
    }
  }
</style>
