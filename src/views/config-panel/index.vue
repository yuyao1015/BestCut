<template>
  <SectionBox :title="title">
    <template #content>
      <div class="h-20 w-20 bg-red-200" v-click-outside="outside"></div>
    </template>
  </SectionBox>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import SectionBox from '@/layouts/SectionBox.vue';

  import { useI18n } from '@/hooks/useI18n';
  import { ClickOutside } from '@/directives';

  export default defineComponent({
    name: 'ConfigPanel',
    components: {
      SectionBox,
    },
    directives: { ClickOutside },
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

      const outside = () => {
        // console.log('outside');
      };
      return {
        title,
        outside,
      };
    },
  });
</script>

<style>
  /* 1 */
</style>
