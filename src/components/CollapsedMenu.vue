<template>
  <Collapse
    class="overflow-y-scroll h-full px-2"
    :bordered="false"
    accordion
    :expandIcon="icon"
    v-model:activeKey="activeLib"
  >
    <CollapsePanel
      v-for="(resource, i) of libs"
      :key="i"
      :class="[selectedLib === i ? 'active-color' : 'text-white', 'my-2']"
      :header="t(`resource.${resource.libName}`)"
      :showArrow="Boolean(resource.fragments.length > 1)"
    >
      <div v-if="resource.fragments.length && resource.fragments[0].name">
        <div
          v-for="(fragment, j) in resource.fragments"
          :key="fragment.name"
          :class="[selectedFragment === j ? 'active-color' : '', 'my-2']"
          @click="switchItem(j)"
        >
          {{ fragment.name }}
        </div>
      </div>
    </CollapsePanel>
  </Collapse>
</template>
<script lang="ts">
  import type { ResourceLibItem } from '#/resource';
  import { computed, defineComponent, h, PropType, ref, watch } from 'vue';
  import { Collapse, CollapsePanel } from 'ant-design-vue';

  import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons-vue';

  import { useI18n } from '@/hooks/useI18n';

  export default defineComponent({
    name: 'CollapsedMenu',
    components: {
      Collapse,
      CollapsePanel,
    },
    props: {
      libs: {
        type: Array as PropType<ResourceLibItem[]>,
        default: [],
      },
      selectedLib: {
        type: Number,
        default: 0,
      },
      selectedFragment: {
        type: Number,
        default: 0,
      },
    },
    emits: ['update:selectedLib', 'update:selectedFragment'],
    setup(props, { emit }) {
      const { t } = useI18n();

      const activeLib = ref(props.selectedLib);
      const selectedLib = ref(props.selectedLib);
      const selectedFragment = ref(props.selectedFragment);

      const libs = computed(() => props.libs);

      watch(activeLib, () => {
        if (activeLib.value) {
          selectedLib.value = +activeLib.value;
        }
        emit('update:selectedLib', selectedLib.value);
      });
      watch(
        () => props.selectedLib,
        () => (activeLib.value = selectedLib.value = props.selectedLib)
      );
      watch(
        () => props.selectedFragment,
        () => (selectedFragment.value = props.selectedFragment)
      );

      const switchItem = (idx: number) => {
        selectedFragment.value = idx;
        emit('update:selectedFragment', idx);
      };

      // const icon = (prop: Recordable) => {
      const icon = (prop: any) => {
        const bool = prop.panelKey === activeLib.value;
        return bool ? h(CaretDownOutlined) : h(CaretRightOutlined);
      };

      return {
        libs,
        selectedLib,
        activeLib,
        selectedFragment,
        t,
        icon,
        switchItem,
      };
    },
  });
</script>

<style scoped lang="less">
  .ant-collapse {
    background-color: #272728;
  }

  :deep(.ant-collapse-item) {
    border: 0;

    .ant-collapse-header {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      background-color: #525155;
      color: inherit;
      font-size: 12px;
      width: 100%;
      padding: 4px 8px 4px 4px;
      border-radius: 0.375rem;

      .ant-collapse-arrow {
        position: relative;
        top: 0;
        left: 0;
        transform: none;
        font-size: 10px;
        margin-right: 2px;
      }
    }
  }

  :deep(.ant-collapse-item.ant-collapse-no-arrow > .ant-collapse-header) {
    padding-left: 12px;
  }

  :deep(.ant-collapse-item:last-child .ant-collapse-header) {
    border-radius: 0.375rem;
  }

  :deep(.ant-collapse-content) {
    display: flex;
    justify-content: center;

    .ant-collapse-content-box {
      background-color: #272728;
      padding: 0 !important;
      color: #fff;
    }
  }

  .resourceLib:first-child {
    margin-top: 1rem;
  }
</style>
