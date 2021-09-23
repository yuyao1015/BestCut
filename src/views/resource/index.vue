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
      <component :is="currentLib.component(currentLib.fragments)" class="m-1" />
    </template>
  </SectionBox>
</template>

<script lang="ts">
  import { computed, defineComponent, ref, watch } from 'vue';

  import SectionBox from '@/layouts/SectionBox.vue';
  import CollapsedMenu from '@/components/CollapsedMenu.vue';

  import { useI18n } from '@/hooks/useI18n';
  import { tabsData } from './routes';

  import axios from 'axios';
  import { useResourceList } from './useResource';

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
      const selectedLib = ref(0);
      const selectedFragment = ref(0);

      const tabs = ref(tabsData);
      const resourceLibs = computed(() => tabs.value[activeTab.value].libs);
      const currentLib = computed(() => resourceLibs.value[selectedLib.value]);

      const updateFragments = async () => {
        if (!currentLib.value.fragments.length) {
          const { data } = await axios.get(`/${currentLib.value.libName}`);
          currentLib.value.fragments = data;
        }
      };
      updateFragments();
      watch(selectedLib, async () => updateFragments());

      const switchTab = (idx: number) => {
        activeTab.value = idx;
      };

      return {
        title,
        activeTab,
        selectedLib,
        selectedFragment,
        tabsData,
        resourceLibs,
        currentLib,
        switchTab,
        useResourceList,
      };
    },
  });
</script>

<style>
  /* 1 */
</style>
