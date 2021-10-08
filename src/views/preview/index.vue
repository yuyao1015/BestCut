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

<script lang="tsx">
  import { defineComponent, ref, watch, computed, h, onMounted, onUnmounted } from 'vue';
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
      // const title = t('components.preview');

      const resourceStore = useResourceStore();
      const playerStore = usePlayerStore();

      const title = computed(() => {
        const { resource } = resourceStore;
        if (resource)
          return h('div', { class: 'h-full flex item-center' }, [
            h('span', { class: 'w-1 h-1 rounded-md bg-yellow-500 mr-1' }),
            `正在预览 一 ${t('components.' + resource.type)}`,
          ]);
        return `${t('components.player')}`;
      });

      const active = ref(false);
      const total = computed(() => {
        return active.value ? playerStore.total : '00:00:00:00';
      });
      const current = computed(() => {
        return active.value ? playerStore.current : '00:00:00:00';
      });

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

      const shortcut = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
          e.preventDefault();
          pauseResume();
        } else if (e.code == 'ArrowLeft') {
          playerStore.prev();
        } else if (e.code == 'ArrowRight') {
          playerStore.next();
        }
      };

      onMounted(() => {
        window.addEventListener('keydown', shortcut);
      });
      onUnmounted(() => {
        window.removeEventListener('keydown', shortcut);
      });

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
