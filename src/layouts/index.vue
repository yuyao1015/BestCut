<template>
  <Layout class="layout">
    <LayoutHeader class="layout-header bg-black">
      <slot name="header">
        <div class="center">
          {{ t('common.header') }}
          <a-button class="absolute right-36" @click="switchLang">
            {{ getLocaleText }}
          </a-button>
        </div>
      </slot>
    </LayoutHeader>

    <Layout class="layout-content bg-black px-2" :style="`height: ${95 - trackRatio}vh;`">
      <LayoutSider :width="resourceW">
        <slot name="resource">
          <div class="center bg-blue-500 rounded-md">{{ t('common.resource') }}</div>
        </slot>
      </LayoutSider>

      <Splitter vertical :value="splitterWidth" @width="onWidthChangeLeft"></Splitter>

      <LayoutContent class="bg-black">
        <slot name="preview">
          <div class="center bg-green-500 rounded-md">{{ t('common.preview') }}</div>
        </slot>
      </LayoutContent>

      <Splitter vertical :value="splitterWidth" @width="onWidthChangeRight"></Splitter>
      <LayoutSider :width="configW">
        <slot name="config">
          <div class="center bg-red-500 rounded-md">{{ t('common.config') }}</div>
        </slot>
      </LayoutSider>
    </Layout>

    <Splitter :value="splitterHeight" @height="onHeightChange"></Splitter>

    <LayoutFooter
      class="layout-footer bg-black px-2 pb-2 pt-0"
      :style="`height: calc(${trackRatio}vh - ${splitterHeight}px)`"
    >
      <slot name="track">
        <div class="center bg-purple-500 rounded-md">{{ t('common.track') }}</div>
      </slot>
    </LayoutFooter>
  </Layout>
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, onUnmounted, ref, unref, watchEffect } from 'vue';

  import { Layout } from 'ant-design-vue';

  import Splitter from '@/components/Splitter.vue';
  import { useI18n } from '@/hooks/useI18n';
  import { useLocale } from '@/locales/useLocale';
  import { localeList } from '@/locales/localeSetting';

  export default defineComponent({
    components: {
      Layout,
      LayoutHeader: Layout.Header,
      LayoutSider: Layout.Sider,
      LayoutContent: Layout.Content,
      LayoutFooter: Layout.Footer,
      Splitter,
    },
    props: {
      leftRatio: {
        type: Number,
        default: 0.3,
      },
      rightRatio: {
        type: Number,
        default: 0.25,
      },
      bottomRatio: {
        type: Number,
        default: 0.4,
      },
    },
    setup(props) {
      const { leftRatio, rightRatio, bottomRatio } = props;
      const resourceW = ref(0);
      const configW = ref(0);

      const splitterWidth = ref(10);
      const splitterHeight = ref(10);

      const previewRatio = rightRatio;

      const resourceRatio = ref(leftRatio);
      const configRatio = ref(rightRatio);
      const trackRatio = ref(bottomRatio * 100);

      const updateWidth = () => {
        const { clientWidth } = document.body;
        resourceW.value = clientWidth * resourceRatio.value;
        configW.value = clientWidth * configRatio.value;
      };

      onMounted(() => {
        window.addEventListener('resize', updateWidth);
        updateWidth();
      });

      onUnmounted(() => {
        window.removeEventListener('resize', updateWidth);
      });

      const onWidthChangeLeft = (widthChange: any) => {
        let { pre } = widthChange;
        const { clientWidth: w } = document.body;
        pre = pre > w * leftRatio ? pre : w * leftRatio;
        const remain = w * (1 - previewRatio) - configW.value - 2 * splitterWidth.value;
        resourceW.value = remain > pre ? pre : remain;
        resourceRatio.value = resourceW.value / w;
      };

      const onWidthChangeRight = (widthChange: any) => {
        let { after } = widthChange;
        const { clientWidth: w } = document.body;
        after = after > w * rightRatio ? after : w * rightRatio;
        const remain = w * (1 - previewRatio) - resourceW.value - 2 * splitterWidth.value;
        configW.value = remain > after ? after : remain;
        configRatio.value = configW.value / w;
      };

      const onHeightChange = (heightChange: any) => {
        let { after } = heightChange;
        const { innerHeight: h } = window;
        let ratio = (after / h) * 100;
        ratio = Math.max(ratio, 30);
        ratio = Math.min(ratio, 60);
        trackRatio.value = ratio;
      };

      const { t } = useI18n();
      const idx = ref<number>(0);
      const { changeLocale, getLocale } = useLocale();

      const getLocaleText = computed(() => {
        return localeList[Number(!idx.value)].text;
      });

      watchEffect(() => {
        idx.value = localeList.findIndex((v) => v.event === unref(getLocale));
      });

      const switchLang = async () => {
        const lang = localeList[Number(!idx.value)].event;
        await changeLocale(lang);
        location.reload();
      };

      return {
        resourceW,
        configW,
        trackRatio,
        getLocaleText,
        splitterWidth,
        splitterHeight,
        onWidthChangeLeft,
        onWidthChangeRight,
        onHeightChange,
        switchLang,
        t,
      };
    },
  });
</script>

<style lang="less" scoped>
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #fff;
    font-size: 30px;
  }

  .layout-header {
    height: 5vh;
  }

  .ant-layout-sider {
    transition: 0ms;
    background-color: black;
  }
</style>
