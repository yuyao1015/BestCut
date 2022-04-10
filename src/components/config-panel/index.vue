<template>
  <SectionBox :title="title">
    <template #content>
      <div h-full w-full> </div>
    </template>
  </SectionBox>
</template>

<script lang="ts" setup>
import SectionBox from '@/layouts/SectionBox.vue';

const { t } = useI18n();
const title = t('components.config');
</script>

<style scoped></style>
