<template>
  <Layout>
    <!-- <template #header></template> -->

    <template #resource>
      <SectionBox :title="t('components.resource')">
        <template #content>
          <ResourceBox></ResourceBox>
        </template>
      </SectionBox>
    </template>

    <template #preview>
      <SectionBox :title="t('components.preview')">
        <template #content>
          <ResourceBox></ResourceBox>
        </template>
      </SectionBox>
    </template>
    <template #config>
      <SectionBox :title="t('components.config')"></SectionBox>
    </template>

    <template #footer>
      <SectionBox :title="t('components.tracks')"></SectionBox>
    </template>
  </Layout>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import Layout from '@/layouts/index.vue';
  import SectionBox from '@/components/SectionBox.vue';
  import ResourceBox from '@/components/ResourceBox.vue';

  import { useI18n } from '@/hooks/useI18n';

  export default defineComponent({
    name: 'Editor',
    components: {
      Layout,
      SectionBox,
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
