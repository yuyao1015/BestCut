<template>
  <SectionBox :title="title">
    <template #content>
      <div></div>
    </template>
  </SectionBox>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import SectionBox from '@/layouts/SectionBox.vue';

  import { useI18n } from '@/hooks/useI18n';

  export default defineComponent({
    name: 'ConfigPanel',
    components: {
      SectionBox,
    },
    props: {
      prop: {
        type: String,
        default: '',
      },
    },
    emits: [],
    setup() {
      const { t } = useI18n();
      const title = t('components.config');

      return {
        title,
      };
    },
  });
</script>

<style>
  /* 1 */
</style>
