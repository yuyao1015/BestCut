<template>
  <ConfigProvider :locale="getAntdLocale">
    <RouterView />
  </ConfigProvider>
</template>

<script lang="ts" setup>
import { ConfigProvider } from 'ant-design-vue';
import { useLocale } from '@/hooks/useLocale';
import { useTitle } from '@/hooks/useTitle';

useTitle();

const { getAntdLocale } = useLocale();
</script>
