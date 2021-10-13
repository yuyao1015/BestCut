<template>
  <div class="flex w-full mb-2">
    <div class="track-container-head h-full" :style="`flex:0 0 ${trackHeadWidth}px;`">
      <slot></slot>
    </div>
    <div class="list w-full h-full flex flex-col justify-center">
      <div class="" v-for="(tracks, idx) in list" :key="idx">
        <TrackList :tracks="tracks" :main="isMain" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import type { TrackItem } from '#/track';

  import { computed, defineComponent, PropType } from 'vue';

  import TrackList from './TrackList.vue';

  import { trackHeadWidth } from '@/settings/componentSetting';

  export default defineComponent({
    name: '',
    components: {
      TrackList,
    },
    props: {
      list: {
        type: Array as PropType<TrackItem[][]>,
        default: () => [],
      },
    },
    emits: [],
    setup(_, { slots }) {
      const isMain = computed(() => {
        return Boolean(slots.default);
      });
      return {
        isMain,
        trackHeadWidth,
      };
    },
  });
</script>
