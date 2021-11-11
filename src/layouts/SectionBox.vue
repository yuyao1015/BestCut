<template>
  <Layout class="function-area-box text-white h-full">
    <LayoutHeader class="rounded-t-md h-10 flex items-center border-black border-b p-0">
      <slot name="header">
        <div class="h-full capitalize ml-3 select-none">
          <div class="h-full flex items-center" v-if="isString(title)"> {{ title }}</div>
          <component class="flex items-center" v-else :is="title" />
        </div>
      </slot>
    </LayoutHeader>

    <Layout class="rounded-b-md overflow-hidden">
      <LayoutSider v-if="sider" :class="sider.class" :width="sider.width">
        <slot name="sider">
          <div class="center">
            {{ 'sider' }}
          </div>
        </slot>
      </LayoutSider>

      <Layout>
        <LayoutContent class="h-5/6 overflow-auto">
          <slot name="content">
            <div class="center">
              {{ 'content' }}
            </div>
          </slot>
        </LayoutContent>

        <LayoutFooter v-if="footer" class="h-1/6 p-0">
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

  import { isString } from '@/utils/is';

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
        type: [String, Object],
        default: 'header',
      },
      sider: {
        type: Object,
        default: () => null,
      },
      footer: {
        type: Boolean,
        default: false,
      },
    },
    emits: [],
    setup() {
      return {
        isString,
      };
    },
  });
</script>
<style scoped lang="less">
  .ant-layout {
    background-color: #000;
  }

  .ant-layout-sider,
  .ant-layout-content,
  .ant-layout-footer {
    background-color: #272728;
    color: inherit;
  }

  .ant-layout-header {
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
