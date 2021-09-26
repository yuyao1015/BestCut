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
        :selectedFragment="selectedFragment"
        @clickFragment="switchFragment"
      ></CollapsedMenu>
    </template>

    <template #content>
      <keep-alive>
        <component :is="currentLib.component(currentLib.fragments)" class="m-1" />
      </keep-alive>
    </template>
  </SectionBox>
</template>

<script lang="ts">
  import { computed, defineComponent, watch, ref, onMounted, onUnmounted } from 'vue';

  import SectionBox from '@/layouts/SectionBox.vue';
  import CollapsedMenu from '@/components/CollapsedMenu.vue';

  import { useI18n } from '@/hooks/useI18n';

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

      const selectedLib = ref(resourceStore.selectedLib);
      const selectedFragment = ref(resourceStore.selectedFragment);
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
      watch(selectedFragment, (idx: number) => {
        scrollTo(idx);
      });

      const switchFragment = (idx: number) => {
        if (!downScroll) downScroll = true;
        selectedFragment.value = idx;
      };

      const stepArr: number[][] = [];
      let lastScrollHeight = 0;
      let downScroll = false;

      const scrollTo = (idx: number) => {
        const resourceList = document.getElementById('resource-list') as HTMLElement;
        if (!resourceList) return;

        const { children } = resourceList;
        if (children.length < idx) return;
        let h = 0;
        for (let i = 0; i < idx; i++) h += children[i].clientHeight;
        if (downScroll) resourceList.scrollTop = h;
      };

      const switchFragmentByScroll = (e: Event) => {
        const resourceList = document.getElementById('resource-list') as HTMLElement;
        if (!resourceList) return;
        const { scrollTop, children } = resourceList;

        if (!stepArr.length) {
          let h = 0;
          for (let i = 0; i < children.length; i++) {
            stepArr.push([h, h + children[i].clientHeight]);
            h += children[i].clientHeight;
          }
        }

        downScroll = scrollTop > lastScrollHeight;
        for (let i = 0; i < stepArr.length; i++) {
          const [lo, hi] = stepArr[i];
          if (scrollTop > lo && scrollTop < hi && selectedFragment.value !== i) {
            resourceStore.switchFragment(i);
            selectedFragment.value = i;
          }
        }

        lastScrollHeight = scrollTop;
        e.stopPropagation();
      };

      onMounted(() => {
        window.addEventListener('mousewheel', switchFragmentByScroll, { passive: false });
      });
      onUnmounted(() => {
        window.removeEventListener('mousewheel', switchFragmentByScroll);
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
        switchFragment,
        switchTab: resourceStore.switchTab,
      };
    },
  });
</script>

<style>
  /* 1 */
</style>
