<template>
  <div class="flex w-full">
    <div class="track-head h-full" :style="`flex:0 0 ${trackHeadWidth}px;`">
      <slot></slot>
    </div>
    <div class="list w-full h-full flex flex-col justify-center">
      <div class="" v-for="(track, idx) in list" :key="idx">{{ track }}</div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { trackHeadWidth } from '@/settings/componentSetting';

  export default defineComponent({
    name: '',
    components: {
      //
    },
    props: {
      list: {
        type: Array,
        default: () => [],
      },
    },
    emits: [],
    setup() {
      return {
        trackHeadWidth,
      };
    },
  });
</script>
