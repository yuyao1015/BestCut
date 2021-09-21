<template>
  <Layout>
    <!-- <template #header></template> -->

    <template #resource>
      <SectionBox sider :title="t('components.resource')">
        <template #content>
          <ResourceBox v-model:usable="usable"></ResourceBox>
        </template>
      </SectionBox>
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
  import { defineComponent, ref } from 'vue';

  import Layout from '@/layouts/index.vue';
  import SectionBox from '@/layouts/SectionBox.vue';
  import ResourceBox from '@/components/ResourceBox.vue';

  import Preview from '@/views/preview/index.vue';

  import { useI18n } from '@/hooks/useI18n';

  export default defineComponent({
    name: 'Editor',
    components: {
      Layout,
      SectionBox,
      ResourceBox,
      Preview,
    },
    props: {
      //
    },
    emits: [],
    setup() {
      const { t } = useI18n();

      return {
        //
        usable: ref(false),
        t,
      };
    },
  });
</script>
