<template>
  <Layout class="function-area-box text-white h-full">
    <LayoutHeader class="rounded-t-md h-10 flex items-center border-black border-b p-0">
      <slot name="header">
        <div class="capitalize ml-3">
          {{ title }}
        </div>
      </slot>
    </LayoutHeader>

    <Layout class="rounded-b-md overflow-hidden">
      <LayoutSider v-if="sider" class="border-r border-black" width="50">
        <slot name="sider">
          <div class="center">
            {{ 'sider' }}
          </div>
        </slot>
      </LayoutSider>

      <Layout class="">
        <LayoutContent class="">
          <slot name="content">
            <div class="center">
              {{ 'content' }}
            </div>
          </slot>
        </LayoutContent>

        <LayoutFooter v-if="footer" class="h-10 p-0">
          <slot name="footer">
            <div class="center">
              {{ 'footer' }}
            </div>
          </slot>
        </LayoutFooter>
      </Layout>
    </Layout>
  </Layout>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { Layout } from 'ant-design-vue';

  export default defineComponent({
    name: 'SectionBox',
    components: {
      Layout,
      LayoutHeader: Layout.Header,
      LayoutSider: Layout.Sider,
      LayoutContent: Layout.Content,
      LayoutFooter: Layout.Footer,
    },
    props: {
      title: {
        type: String,
        default: 'header',
      },
      sider: {
        type: Boolean,
        default: false,
      },
      footer: {
        type: Boolean,
        default: false,
      },
    },
    emits: [],
    setup() {
      return {
        //
      };
    },
  });
</script>
<style scoped lang="less">
  .ant-layout {
    background-color: #000;
  }

  .ant-layout-sider,
  .ant-layout-content {
    background-color: #272728;
  }

  .ant-layout-header,
  .ant-layout-footer {
    background-color: #414145;
    color: inherit;
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #fff;
  }
</style>
