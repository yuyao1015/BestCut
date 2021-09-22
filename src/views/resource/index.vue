<template>
  <SectionBox sider :title="title">
    <template #header>
      <div class="tabs flex items-center pt-1 px-1 w-full">
        <div
          v-for="(tab, idx) in tabsData"
          :key="idx"
          :class="[activeTab === idx ? 'active-color' : '', 'flex flex-col items-center mx-1']"
          :style="{ width: `${100 / tabsData.length}%` }"
          @click="switchTab(idx)"
        >
          <component :is="tab.icon" class="mb-1"></component>
          <span class="text-xs">{{ tab.name }}</span>
        </div>
      </div>
    </template>

    <template #sider>
      <CollapsedMenu
        :libs="resourceLibs"
        v-model:selectedLib="selectedLib"
        v-model:selectedFragment="selectedFragment"
      ></CollapsedMenu>
    </template>

    <template #content>
      <component :is="resourceLibs[selectedLib].component" class="m-1"></component>
    </template>
  </SectionBox>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';

  import SectionBox from '@/layouts/SectionBox.vue';
  import CollapsedMenu from '@/components/CollapsedMenu.vue';

  import { useI18n } from '@/hooks/useI18n';
  import { tabsData, resourceLibs } from './routes';

  export default defineComponent({
    name: 'ResourceBox',
    components: {
      SectionBox,
      CollapsedMenu,
    },
    props: {
      prop: {
        type: String,
        default: '',
      },
    },
    setup() {
      const { t } = useI18n();
      const title = t('components.resource');

      const activeTab = ref(0);
      const switchTab = (idx: number) => {
        activeTab.value = idx;
      };

      const selectedLib = ref(1);
      const selectedFragment = ref(0);

      return {
        title,
        tabsData,
        resourceLibs,
        activeTab,
        selectedLib,
        selectedFragment,
        switchTab,
      };
    },
  });
</script>

<style>
  /* 1 */
</style>
