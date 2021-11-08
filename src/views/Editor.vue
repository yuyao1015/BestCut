<template>
  <Layout>
    <template #header>
      <div class="h-full flex justify-between items-center text-white">
        <div class="left text-xs text-gray-400">
          {{ new Date().toString().slice(16, 24) + ' 自动保存本地' }}
        </div>

        <div class="right">
          <a-button class="absolute right-36"> </a-button>

          <a-button class="export h-8 px-2" @click="exportMedia">
            <ExportOutlined class="text-md" />
            {{ t('components.export') }}
          </a-button>
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
      <SectionBox :title="t('components.config')"></SectionBox>
    </template>

    <template #track>
      <Tracks />
    </template>
  </Layout>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { ExportOutlined } from '@ant-design/icons-vue';

  import Layout from '@/layouts/index.vue';
  import SectionBox from '@/layouts/SectionBox.vue';

  import Preview from '@/views/preview/index.vue';
  import ResourceBox from '@/views/resource/index.vue';
  import Tracks from '@/views/tracks/index.vue';

  import { useI18n } from '@/hooks/useI18n';

  import { usePlayerStore } from '@/store/player';

  export default defineComponent({
    name: 'Editor',
    components: {
      Layout,
      SectionBox,
      Preview,
      ResourceBox,
      Tracks,
      ExportOutlined,
    },
    emits: [],
    setup() {
      const { t } = useI18n();

      const playerStore = usePlayerStore();

      const exportMedia = () => {
        playerStore.export();
      };

      return {
        t,
        exportMedia,
      };
    },
  });
</script>

<style scoped>
  .export {
    background-color: #6dced7;
    outline: 0;
    border: 0;
    color: #fff;
    display: flex;
    align-items: center;
  }
</style>
