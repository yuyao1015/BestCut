<template>
  <SectionBox :title="title">
    <template #content>
      <div class="h-full w-full"> </div>
    </template>
  </SectionBox>
</template>

<script lang="ts" setup>
import SectionBox from '@/layouts/SectionBox.vue';

import { useI18n } from '@/hooks/useI18n';

const { t } = useI18n();
const title = t('components.config');
</script>

<style scoped></style>
