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
  import { computed, defineComponent, watch, ref } from 'vue';

  import SectionBox from '@/layouts/SectionBox.vue';
  import CollapsedMenu from '@/components/CollapsedMenu.vue';

  import { useI18n } from '@/hooks/useI18n';
  // import { tabsData } from './routes';

  import axios from 'axios';

  import { useResourceStore } from '@/store/resource';

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

      const resourceStore = useResourceStore();

      const selectedLib = ref(0);
      const selectedFragment = ref(0);
      const activeTab = computed(() => resourceStore.activeTab);
      const tabsData = computed(() => resourceStore.tabs);
      const resourceLibs = computed(() => resourceStore.resourceLibs);
      const currentLib = computed(() => resourceStore.currentLib);

      const updateFragments = async () => {
        if (!currentLib.value.fragments.length) {
          const { tabName } = tabsData.value[activeTab.value];
          const { libName } = currentLib.value;
          const { data } = await axios.get(`/${tabName}/${libName}`);
          resourceStore.updateFragments(data);
        }
      };

      watch(activeTab, () => {
        if (resourceStore.selectedFragment !== 0) {
          resourceStore.switchFragment(0);
          selectedFragment.value = 0;
        }
        if (resourceStore.selectedLib === 0) updateFragments();
        else {
          resourceStore.switchLib(0);
          selectedLib.value = 0;
        }
      });
      watch(selectedLib, (idx: number) => {
        resourceStore.switchLib(idx);
        updateFragments();
      });

      updateFragments();

      return {
        title,
        activeTab,
        selectedLib,
        selectedFragment,
        tabsData,
        resourceLibs,
        currentLib,
        switchTab: resourceStore.switchTab,
      };
    },
  });
</script>

<style>
  /* 1 */
</style>
