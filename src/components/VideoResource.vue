<template>
  <Resource>
    <template #content>
      <img class="absolute h-full w-full rounded-md" :src="cover" />

      <FileImageOutlined v-if="resource.type === 'picture'" class="" />
      <div v-else class="">{{ resource.duration }} </div>
    </template>
  </Resource>
</template>
<script lang="ts">
  import { defineComponent, PropType } from 'vue';

  import Resource from '@/components/Resource.vue';

  export default defineComponent({
    name: '',
    components: {
      Resource,
    },
    props: {
      //
      resource: {
        type: Object,
        default: {},
      },
      cover: {
        type: String,
        default: '',
      },
    },
    emits: [],
    setup(props) {
      return {
        //
      };
    },
  });
</script>

<style>
  /* 1 */
</style>
