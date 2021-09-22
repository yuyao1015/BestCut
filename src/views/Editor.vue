<template>
  <Layout>
    <!-- <template #header></template> -->

    <template #resource>
      <ResourceBox></ResourceBox>
    </template>

    <template #preview>
      <Preview> </Preview>
    </template>

    <template #config>
      <SectionBox :title="t('components.config')"></SectionBox>
    </template>

    <template #track>
      <SectionBox sider :title="t('components.tracks')"></SectionBox>
    </template>
  </Layout>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import Layout from '@/layouts/index.vue';
  import SectionBox from '@/layouts/SectionBox.vue';

  import Preview from '@/views/preview/index.vue';
  import ResourceBox from '@/views/resource/index.vue';

  import { useI18n } from '@/hooks/useI18n';

  export default defineComponent({
    name: 'Editor',
    components: {
      Layout,
      SectionBox,
      Preview,
      ResourceBox,
    },
    props: {
      //
    },
    emits: [],
    setup() {
      const { t } = useI18n();

      return {
        //
        t,
      };
    },
  });
</script>
