<template>
  <Layout class="layout">
    <LayoutHeader class="bg-black layout-header">
      <slot name="header">
        <div class="center">
          {{ t('common.header') }}
          <a-button class="absolute right-36" @click="switchLang">
            {{ getLocaleText }}
          </a-button>
        </div>
      </slot>
    </LayoutHeader>

    <Layout class="px-2 bg-black layout-content" :style="`height: ${95 - trackRatio}vh;`">
      <LayoutSider :width="resourceW">
        <slot name="resource">
          <div class="bg-blue-500 rounded-md center">{{ t('common.resource') }}</div>
        </slot>
      </LayoutSider>

      <Splitter class="splitter" vertical :value="splitterWidth" @width="onWidthChangeLeft" />

      <LayoutContent class="bg-black">
        <slot name="preview">
          <div class="bg-green-500 rounded-md center">{{ t('common.preview') }}</div>
        </slot>
      </LayoutContent>

      <Splitter class="splitter" vertical :value="splitterWidth" @width="onWidthChangeRight" />
      <LayoutSider :width="configW">
        <slot name="config">
          <div class="bg-red-500 rounded-md center">{{ t('common.config') }}</div>
        </slot>
      </LayoutSider>
    </Layout>

    <Splitter class="splitter" :value="splitterHeight" @height="onHeightChange" />

    <LayoutFooter
      class="px-2 pt-0 pb-2 bg-black layout-footer"
      :style="`height: calc(${trackRatio}vh - ${splitterHeight}px)`"
    >
      <slot name="track">
        <div class="bg-purple-500 rounded-md center">{{ t('common.track') }}</div>
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
  import { useResourceStore } from '@/store/resource';
  import _ from 'lodash-es';

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

      const ratio = 16 / 9;

      const canvasSizeChange = () => {
        const { innerWidth, innerHeight } = window;
        let previewCanvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
        if (!previewCanvas) previewCanvas = document.createElement('canvas');

        const previewW =
          innerWidth * (1 - resourceRatio.value - configRatio.value) - 2 * splitterWidth.value;
        const previewH =
          innerHeight * (1 - 0.05 - trackRatio.value / 100) - 1 * splitterHeight.value;

        let w = Math.floor(previewW * 0.9);
        let h = Math.floor(previewH * 0.7);
        while (w / ratio > h) w *= 0.99;

        const resizeProportion = w / previewCanvas.width;
        previewCanvas.width = w;
        previewCanvas.height = Math.floor(w / ratio);
        useResourceStore().onPreviewCanvasSizeChange(resizeProportion);
      };
      const canvasSizeChangeDebounce = _.debounce(canvasSizeChange, 10);
      const onResize = () => {
        const { innerWidth: w } = window;
        resourceW.value = w * resourceRatio.value;
        configW.value = w * configRatio.value;
        canvasSizeChangeDebounce();
      };

      onMounted(() => {
        window.addEventListener('resize', onResize);
        document.addEventListener('fullscreenchange', onResize);
        onResize();
      });

      onUnmounted(() => {
        window.removeEventListener('resize', onResize);
        document.removeEventListener('fullscreenchange', onResize);
      });

      const onWidthChangeLeft = (widthChange: any) => {
        let { pre } = widthChange;
        const { clientWidth: w } = document.body;
        pre = pre > w * leftRatio ? pre : w * leftRatio;
        const remain = w * (1 - previewRatio) - configW.value - 2 * splitterWidth.value;
        resourceW.value = remain > pre ? pre : remain;
        resourceRatio.value = resourceW.value / w;
        canvasSizeChangeDebounce();
      };

      const onWidthChangeRight = (widthChange: any) => {
        let { after } = widthChange;
        const { clientWidth: w } = document.body;
        after = after > w * rightRatio ? after : w * rightRatio;
        const remain = w * (1 - previewRatio) - resourceW.value - 2 * splitterWidth.value;
        configW.value = remain > after ? after : remain;
        configRatio.value = configW.value / w;
        canvasSizeChangeDebounce();
      };

      const onHeightChange = (heightChange: any) => {
        let { after } = heightChange;
        const { innerHeight: h } = window;
        let ratio = (after / h) * 100;
        ratio = Math.max(ratio, 30);
        ratio = Math.min(ratio, 60);
        trackRatio.value = ratio;

        canvasSizeChangeDebounce();
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
