<template>
  <div class="h-full overflow-y-scroll">
    <div v-for="(fragment, j) in list" :key="j" class="flex flex-col">
      <div class="">{{ fragment.name }}</div>
      <div class="flex flex-wrap">
        <Resource
          v-for="(resource, i) in fragment.list"
          :key="i"
          class="local-resource-list relative mx-0.5 my-2 text-xs"
          :usable="true"
          :type="resource.type"
          :cover="resource.cover"
          :duration="resource.duration"
        >
        </Resource>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import type { ResourceFragment } from '#/resource';

  import { defineComponent, PropType } from 'vue';
  import Resource from '@/components/Resource.vue';

  export default defineComponent({
    name: '',
    components: {
      Resource,
    },
    props: {
      //
      list: {
        type: Array as PropType<ResourceFragment[]>,
        default: () => [],
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

<style>
  /* 1 */
</style>
