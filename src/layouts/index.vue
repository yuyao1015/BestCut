<template>
  <Layout>
    <LayoutHeader class="header"></LayoutHeader>

    <Layout class="content">
      <LayoutSider class="resource" :width="resourceW"></LayoutSider>

      <Splitter vertical @width="onWidthChangeLeft"></Splitter>

      <LayoutContent class="preview"></LayoutContent>

      <Splitter vertical @width="onWidthChangeRight"></Splitter>

      <LayoutSider class="config" :width="configW"></LayoutSider>
    </Layout>

    <Splitter></Splitter>

    <LayoutFooter class="footer"></LayoutFooter>
  </Layout>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';

  import { Layout } from 'ant-design-vue';

  import Splitter from '@/components/Splitter.vue';

  export default defineComponent({
    components: {
      Layout,
      LayoutHeader: Layout.Header,
      LayoutSider: Layout.Sider,
      LayoutContent: Layout.Content,
      LayoutFooter: Layout.Footer,
      Splitter,
    },
    setup() {
      const resourceW = ref(0);
      const resourceMinW = ref(0);
      const resourceMaxW = ref(0);
      const configW = ref(0);
      const configMinW = ref(0);
      const configMaxW = ref(0);

      onMounted(() => {
        const { clientWidth } = document.body;
        resourceMinW.value = resourceW.value = clientWidth * 0.3;
        resourceMaxW.value = clientWidth * 0.5;
        configMinW.value = configW.value = clientWidth * 0.25;
        configMaxW.value = clientWidth * 0.45;
      });

      const onWidthChangeLeft = (widthChange: any) => {
        let { preW } = widthChange;
        const { clientWidth: w } = document.body;
        preW = preW > w * 0.3 ? preW : w * 0.3;
        const remain = w * 0.75 - configW.value - 20;
        resourceW.value = remain > preW ? preW : remain;
      };

      const onWidthChangeRight = (widthChange: any) => {
        let { afterW } = widthChange;
        const { clientWidth: w } = document.body;
        afterW = afterW > w * 0.25 ? afterW : w * 0.25;
        const remain = w * 0.75 - resourceW.value - 20;
        configW.value = remain > afterW ? afterW : remain;
      };

      return {
        resourceW,
        configW,
        onWidthChangeLeft,
        onWidthChangeRight,
      };
    },
  });
</script>

<style lang="less">
  .header {
    height: 5vh;
  }

  .content {
    height: 55vh;
    min-height: 35vh;
    max-height: 65vh;
  }

  .preview {
    background-color: green;
  }

  .resource {
    background-color: blue;
    // transition: 0ms !important;
  }

  .config {
    background-color: red;
    // transition: 0ms !important;
  }

  .footer {
    height: calc(40vh - 10px);
    min-height: 30vh;
    background: #432143;
  }

  .ant-layout-sider {
    transition: 0ms;
  }
</style>
