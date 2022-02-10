<template>
  <Layout class="function-area-box text-white h-full">
    <Layout.Header class="rounded-t-md h-10 flex items-center border-black border-b p-0">
      <slot name="header">
        <div class="h-full capitalize ml-3 select-none">
          <div class="h-full flex items-center" v-if="isString(title)"> {{ title }}</div>
          <component class="flex items-center" v-else :is="title" />
        </div>
      </slot>
    </Layout.Header>

    <Layout class="rounded-b-md overflow-hidden">
      <Layout.Sider v-if="sider" :class="sider.class" :width="sider.width">
        <slot name="sider">
          <div class="center">
            {{ 'sider' }}
          </div>
        </slot>
      </Layout.Sider>

      <Layout>
        <Layout.Content class="h-5/6 overflow-auto">
          <slot name="content">
            <div class="center">
              {{ 'content' }}
            </div>
          </slot>
        </Layout.Content>

        <Layout.Footer v-if="footer" class="h-1/6 p-0">
          <slot name="footer">
            <div class="center">
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
