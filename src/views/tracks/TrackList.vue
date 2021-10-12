<template>
  <div class="flex">
    <div class="track-head h-full" :style="`width: ${trackHeadWidth}px;`">
      <slot></slot>
    </div>
    <div class="list w-full h-full">
      <div v-for="(track, idx) in list" :key="idx"></div>
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
      // width: {
      //   type: Number,
      //   default: 110,
      // },
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
