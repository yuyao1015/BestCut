<template>
  <Layout class="function-area-box" text-white h-full>
    <Layout.Header rounded-t-md flex items-center p-0 border-b border-black>
      <slot name="header">
        <div h-full ml-3 select-none capitalize>
          <div flex items-center h-full v-if="isString(title)"> {{ title }}</div>
          <component flex items-center v-else :is="title" />
        </div>
      </slot>
    </Layout.Header>

    <Layout rounded-b-md overflow-hidden>
      <Layout.Sider v-if="sider" :class="sider.class" :width="sider.width">
        <slot name="sider">
          <div center>
            {{ 'sider' }}
          </div>
        </slot>
      </Layout.Sider>

      <Layout>
        <Layout.Content h="5/6" overflow-auto>
          <slot name="content">
            <div center>
              {{ 'content' }}
            </div>
          </slot>
        </Layout.Content>

        <Layout.Footer v-if="footer" h="1/6">
          <slot name="footer">
            <div center>
              {{ 'footer' }}
            </div>
          </slot>
        </Layout.Footer>
      </Layout>
    </Layout>
  </Layout>
</template>
<script lang="ts" setup>
import type { PropType } from 'vue';
import { Layout } from 'ant-design-vue';

import { isString } from '@/utils/is';

defineProps({
  title: {
    type: [String, Object],
    default: 'header',
  },
  sider: {
    type: Object as PropType<{ class: string; width: number }>,
    default: null,
  },
  footer: {
    type: Boolean,
    default: false,
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
  padding: 0;
}

.ant-layout-header {
  padding: 0;
  height: 2.5rem;
  background-color: #414145;
  color: inherit;
}
</style>
