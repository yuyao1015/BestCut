<template>
  <Layout>
    <!-- <template #header></template> -->
    <!-- <template #resource></template> -->

    <!-- <template #preview>
      <div>preview</div>
    </template> -->
    <!-- <template #config></template> -->

    <!-- <template #footer></template> -->
  </Layout>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import Layout from '@/layouts/index.vue';

  export default defineComponent({
    name: 'Editor',
    components: {
      Layout,
    },
    props: {
      //
    },
    emits: [],
    setup() {
      return {
        //
      };
    },
  });
</script>
