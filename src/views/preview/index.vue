<template>
  <SectionBox footer :title="title">
    <template #content>
      <div class="h-full flex items-center">
        <canvas id="preview-canvas" class="bg-black mx-auto"></canvas>
      </div>
    </template>

    <template #footer>
      <div :class="[active ? '' : 'opacity-50', 'preview-panel h-full relative flex items-center']">
        <div class="absolute flex flex-col items-center left-2">
          <div class="text-red-500">{{ currentTime }}</div>
          <div class="border-white border-t">{{ duration }}</div>
        </div>
        <div
          class="absolute flex left-1/2 -translate-x-1/2 text-lg cursor-pointer"
          @click="pauseResume"
        >
          <CaretRightOutlined v-if="!paused" />
          <PauseOutlined v-else />
        </div>
        <div class="absolute w-15 right-2 flex items-center">
          <button class="mr-2">原始</button>
          <FullscreenOutlined class="cursor-pointer" @click="fullScreen" />
        </div>
      </div>
    </template>
  </SectionBox>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { CaretRightOutlined, PauseOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
  import SectionBox from '@/layouts/SectionBox.vue';
  import { useI18n } from '@/hooks/useI18n';

  export default defineComponent({
    name: '',
    components: {
      SectionBox,
      CaretRightOutlined,
      PauseOutlined,
      FullscreenOutlined,
    },
    props: {
      active: {
        type: Boolean,
        default: false,
      },
    },
    emits: [],
    setup() {
      const { t } = useI18n();
      const title = t('components.preview');

      const paused = ref(false);
      const pauseResume = () => {
        paused.value = !paused.value;
      };

      const fullScreen = () => {
        // TODO:
      };

      return {
        title,
        paused,
        currentTime: '00:07:35:28',
        duration: '00:10:34:17',
        pauseResume,
        fullScreen,
      };
    },
  });
</script>
<style lang="less" scoped>
  .preview-panel {
    background-color: #272728;
  }
</style>
