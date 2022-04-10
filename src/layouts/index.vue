<template>
  <Layout>
    <Layout.Header>
      <slot name="header">
        <div center h-full>
          {{ t('common.header') }}
          <a-button @click="switchLang" absolute right-36>
            {{ getLocaleText }}
          </a-button>
        </div>
      </slot>
    </Layout.Header>

    <Layout class="layout-content" :style="`height: ${95 - trackRatio}vh;`" bg-black px-2>
      <Layout.Sider :width="resourceW">
        <slot name="resource">
          <div center bg-blue-500 rounded-md>{{ t('common.resource') }}</div>
        </slot>
      </Layout.Sider>

      <Splitter class="splitter" vertical :value="splitterWidth" @width="onWidthChangeLeft" />

      <Layout.Content class="bg-black">
        <slot name="preview">
          <div center rounded-md bg-green-500>{{ t('common.preview') }}</div>
        </slot>
      </Layout.Content>

      <Splitter class="splitter" vertical :value="splitterWidth" @width="onWidthChangeRight" />
      <Layout.Sider :width="configW">
        <slot name="config">
          <div center rounded-md bg-red-500>{{ t('common.config') }}</div>
        </slot>
      </Layout.Sider>
    </Layout>

    <Splitter class="splitter" :value="splitterHeight" @height="onHeightChange" />

    <Layout.Footer bg-black :style="`height: calc(${trackRatio}vh - ${splitterHeight}px)`">
      <slot name="track">
        <div center rounded-md bg-purple-500>{{ t('common.track') }}</div>
      </slot>
    </Layout.Footer>
  </Layout>
</template>

<script lang="ts" setup>
import { Layout } from 'ant-design-vue';
import _ from 'lodash-es';

import Splitter from '@/components/Splitter.vue';
import { useLocale } from '@/hooks/useLocale';

import { CanvasId } from '@/settings/playerSetting';
import { useResourceStore } from '@/store/resource';
import { usePreviewStore } from '@/store/preview';
import { useTrackStore } from '@/store/track';

type Props = {
  leftRatio?: number;
  rightRatio?: number;
  bottomRatio?: number;
};

const props = withDefaults(defineProps<Props>(), {
  leftRatio: 0.3,
  rightRatio: 0.25,
  bottomRatio: 0.4,
});

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

const previewStore = usePreviewStore();
const trackStore = useTrackStore();

const canvasSizeChange = () => {
  const { innerWidth, innerHeight } = window;
  let previewCanvas = document.getElementById(CanvasId) as HTMLCanvasElement;
  if (!previewCanvas) previewCanvas = document.createElement('canvas');

  const previewW =
    innerWidth * (1 - resourceRatio.value - configRatio.value) - 2 * splitterWidth.value;
  const previewH = innerHeight * (1 - 0.05 - trackRatio.value / 100) - 1 * splitterHeight.value;

  let w = Math.floor(previewW * 0.9);
  let h = Math.floor(previewH * 0.7);
  while (w / ratio > h) w *= 0.99;

  const resizeProportion = w / previewCanvas.width;
  previewCanvas.width = w;
  previewCanvas.height = Math.floor(w / ratio);

  useResourceStore().onPreviewCanvasSizeChange(resizeProportion);
  if (useResourceStore().resource) previewStore.player.updateSize();
  if (!trackStore.isMapEmpty()) return trackStore.manager.updateSize();
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
const { locale, availableLocales, changeLocale } = useLocale();

const getLocaleText = computed(() => {
  return t(`common.language`);
});

watchEffect(() => {
  idx.value = availableLocales.findIndex((v) => v === unref(locale));
});

const switchLang = async () => {
  const lang = availableLocales[Number(!idx.value)];
  await changeLocale(lang);
  location.reload();
};
</script>

<style lang="less" scoped>
.ant-layout-header {
  height: 5vh;
  background: black;
}

.ant-layout .ant-layout-has-sider {
  transition: 0ms;
  background: black;
}

.ant-layout-footer {
  background: black;
  padding: 0 0.5rem 0.5rem;
}
</style>
