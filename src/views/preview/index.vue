<template>
  <SectionBox footer :title="title" id="preview-box">
    <template #content>
      <div class="h-full flex items-center">
        <canvas id="preview-canvas" class="bg-black mx-auto"></canvas>
      </div>
    </template>

    <template #footer>
      <div :class="[active ? '' : 'opacity-50', 'preview-panel h-full relative flex items-center']">
        <div class="absolute flex flex-col items-center left-2">
          <div class="active-color">{{ current }}</div>
          <div class="border-white border-t">{{ total }}</div>
        </div>
        <div
          class="absolute flex left-1/2 -translate-x-1/2 text-lg cursor-pointer"
          @click="pauseResume"
        >
          <CaretRightOutlined v-if="paused" />
          <PauseOutlined v-else />
        </div>
        <div class="absolute w-15 right-2 flex items-center leading-7">
          <button class="mr-2">原始</button>
          <FullscreenOutlined class="cursor-pointer" @click="fullScreen" />
        </div>
      </div>
    </template>
  </SectionBox>
</template>
<script lang="ts">
  import { defineComponent, ref, watch, computed } from 'vue';
  import { CaretRightOutlined, PauseOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
  import SectionBox from '@/layouts/SectionBox.vue';
  import { useI18n } from '@/hooks/useI18n';

  import { useResourceStore } from '@/store/resource';
  import { usePlayerStore } from '@/store/player';

  export default defineComponent({
    name: '',
    components: {
      SectionBox,
      CaretRightOutlined,
      PauseOutlined,
      FullscreenOutlined,
    },
    props: {
      prop: {
        type: Boolean,
        default: false,
      },
    },
    emits: [],
    setup() {
      const { t } = useI18n();
      const title = t('components.preview');

      const resourceStore = useResourceStore();
      const playerStore = usePlayerStore();

      const active = ref(false);
      const total = computed(() => playerStore.total);
      const current = computed(() => playerStore.current);

      const paused = computed(() => playerStore.paused);
      const pauseResume = () => {
        if (!active.value) return;
        playerStore.pauseResume();
      };

      watch(
        () => resourceStore.resource,
        () => {
          if (resourceStore.resource) active.value = true;
          else active.value = false;
        }
      );

      const fullScreen = () => {
        // TODO:
      };

      return {
        title,
        paused,
        active,
        current,
        total,
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
