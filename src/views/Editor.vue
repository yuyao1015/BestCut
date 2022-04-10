<template>
  <Layout>
    <template #header>
      <div h-full flex justify-between items-center text-white>
        <div class="left" text="xs gray-400">
          {{ new Date().toString().slice(16, 24) + ' 自动保存本地' }}
        </div>

        <div class="right">
          <button right-36 absolute></button>
          <button
            class="flex items-center justify-center h-8 w-16 p-2 rounded-sm texx-white bg-#6dced7"
            @click="exportWorkspace"
          >
            <ExportOutlined text-md mr-1 />
            {{ t('components.export') }}
          </button>
        </div>
      </div>
    </template>

    <template #resource>
      <ResourceBox />
    </template>

    <template #preview>
      <Preview />
    </template>

    <template #config>
      <ConfigPanel />
    </template>

    <template #track>
      <Tracks />
    </template>
  </Layout>
</template>

<script lang="ts" setup>
import { ExportOutlined } from '@ant-design/icons-vue';

import Layout from '@/layouts/index.vue';
import Preview from '@/components/preview/index.vue';
import ResourceBox from '@/components/resource/index.vue';
import Tracks from '@/components/tracks/index.vue';
import ConfigPanel from '@/components/config-panel/index.vue';

import { useTrackStore } from '@/store/track';

const { t } = useI18n();

const trackStore = useTrackStore();

const exportWorkspace = () => {
  trackStore.export();
};
</script>

<route lang="yaml">
meta:
  title: routes.editor
</route>
