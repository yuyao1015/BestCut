<template>
  <Layout class="layout">
    <LayoutHeader class="header">
      <slot name="header">
        <div class="text">
          {{ t('common.header') }}
          <a-button class="absolute right-36" @click="switchLang">
            {{ getLocaleText }}
          </a-button>
        </div>
      </slot>
    </LayoutHeader>

    <Layout class="content border-black border-l-8 border-r-8">
      <LayoutSider :width="resourceW">
        <slot name="resource">
          <div class="text bg-blue-500 rounded-md">{{ t('common.resource') }}</div>
        </slot>
      </LayoutSider>

      <Splitter vertical @width="onWidthChangeLeft"></Splitter>

      <LayoutContent class="bg-black">
        <slot name="preview">
          <div class="text bg-green-500 rounded-md">{{ t('common.preview') }}</div>
        </slot>
      </LayoutContent>

      <Splitter vertical @width="onWidthChangeRight"></Splitter>

      <LayoutSider :width="configW">
        <slot name="config">
          <div class="text bg-red-500 rounded-md">{{ t('common.config') }}</div>
        </slot>
      </LayoutSider>
    </Layout>

    <Splitter :value="splitterHeight"></Splitter>

    <LayoutFooter
      class="footer border-black border-8 bg-black"
      :style="`height: calc(40vh - ${splitterHeight}px)`"
    >
      <slot name="footer">
        <div class="text bg-purple-500 rounded-md">{{ t('common.footer') }}</div>
      </slot>
    </LayoutFooter>
  </Layout>
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, ref, unref, watchEffect } from 'vue';

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
    setup() {
      const resourceW = ref(0);
      const configW = ref(0);

      onMounted(() => {
        const { clientWidth } = document.body;
        resourceW.value = clientWidth * 0.3;
        configW.value = clientWidth * 0.25;
      });

      const onWidthChangeLeft = (widthChange: any) => {
        let { preW } = widthChange;
        const { clientWidth: w } = document.body;
        preW = preW > w * 0.3 ? preW : w * 0.3;
        const remain = w * 0.75 - configW.value - 20;
        resourceW.value = remain > preW ? preW : remain;
      };

      const onWidthChangeRight = (widthChange: any) => {
        let { afterW } = widthChange;
        const { clientWidth: w } = document.body;
        afterW = afterW > w * 0.25 ? afterW : w * 0.25;
        const remain = w * 0.75 - resourceW.value - 20;
        configW.value = remain > afterW ? afterW : remain;
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

      const splitterHeight = ref(2);
      return {
        resourceW,
        configW,
        getLocaleText,
        splitterHeight,
        onWidthChangeLeft,
        onWidthChangeRight,
        switchLang,
        t,
      };
    },
  });
</script>

<style lang="less">
  .text {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #fff;
    font-size: 30px;
  }

  .header {
    height: 5vh;
  }

  .content {
    height: 55vh;
    min-height: 35vh;
    max-height: 65vh;
  }

  .footer {
    min-height: 30vh;
  }

  .ant-layout-sider {
    transition: 0ms;
  }

  .ant-layout-footer {
    // padding: 0 10px 10px 10px;
    padding: 0;
  }
</style>
