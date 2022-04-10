<script lang="tsx">
import SectionBox from '@/layouts/SectionBox.vue';
import CollapsedMenu from './CollapsedMenu.vue';

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
      const { tabName } = tabsData.value[activeTab.value];
      const { libName, update } = currentLib.value;
      if (new Date().getTime() - update > 1e4) {
        const { data } = await axios.get(`/${tabName}/${libName}`);
        data.update > update && resourceStore.updateFragments(data.lib);
        currentLib.value.update = new Date().getTime();
      }
    };

    watch(activeTab, () => {
      if (selectedFragment.value !== 0) {
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

    const switchFragment = () => {
      if (!downScroll) downScroll = true;
    };

    let stepArr: number[][] = [];
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

      if (!stepArr.length || stepArr.length !== currentLib.value.fragments.length) {
        stepArr = [];
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

    const header = () => (
      <div class="tabs flex items-center pt-1 px-1 w-full">
        {tabsData.value.map((tab, idx) => (
          <div
            class={[
              activeTab.value === idx ? 'color-[aqua]' : '',
              'flex flex-col items-center mx-1',
            ]}
            style={{ width: `${100 / tabsData.value.length}%` }}
            onClick={() => resourceStore.switchTab(idx)}
          >
            {tab.icon}
            <span class="text-xs mt-1">{tab.name}</span>
          </div>
        ))}
      </div>
    );

    return () => (
      <SectionBox sider={{ width: 90, class: 'border-r border-black' }} title={title}>
        {{
          header,
          sider: () => (
            <CollapsedMenu
              libs={resourceLibs.value}
              v-models={[
                [selectedLib.value, 'selectedLib'],
                [selectedFragment.value, 'selectedFragment'],
              ]}
              onClickFragment={switchFragment}
            />
          ),
          content: () => currentLib.value.component(currentLib.value.fragments),
        }}
      </SectionBox>
    );
  },
});
</script>
