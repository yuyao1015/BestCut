<template>
  <ConfigProvider :locale="getAntdLocale">
    <RouterView />
  </ConfigProvider>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { ConfigProvider } from 'ant-design-vue';
  import { useLocale } from '@/locales/useLocale';
  import { useTitle } from '@/hooks/useTitle';

  export default defineComponent({
    name: 'App',
    components: { ConfigProvider },
    setup() {
      useTitle();

      const { getAntdLocale } = useLocale();

      return { getAntdLocale };
    },
  });
</script>

<style></style>
