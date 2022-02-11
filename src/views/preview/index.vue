<script lang="tsx">
import { defineComponent, ref, watch, computed, h, onUnmounted, nextTick } from 'vue';
import {
  CaretRightOutlined,
  PauseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons-vue';
import { Slider } from 'ant-design-vue';

import SectionBox from '@/layouts/SectionBox.vue';
import { useI18n } from '@/hooks/useI18n';
import { useFullScreen } from '@/hooks/useFullScreen';

import { useResourceStore } from '@/store/resource';
import { usePreviewStore } from '@/store/preview';
import { useTrackStore } from '@/store/track';
import { CanvasId, PlayerId, Duration0 } from '@/settings/playerSetting';

export default defineComponent({
  name: 'Preview',
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
    const previewStore = usePreviewStore();
    const trackStore = useTrackStore();

    const title = computed(() => {
      const { resource } = resourceStore;
      if (resource)
        return h('div', { class: 'h-full flex items-center' }, [
          h('span', { class: 'w-1 h-1 rounded-md bg-yellow-500 mr-1' }),
          `正在预览 一 ${t('components.' + resource.type)}`,
        ]);
      return `${t('components.player')}`;
    });

    const active = computed(() => {
      return Boolean(resourceStore.resource) || !trackStore.isMapEmpty();
    });
    const total = computed(() => {
      let _total = Duration0;
      if (!trackStore.isMapEmpty()) _total = trackStore.total;
      if (resourceStore.resource) _total = previewStore.total;
      return _total;
    });
    const current = computed(() => {
      let _current = Duration0;
      if (!trackStore.isMapEmpty()) _current = trackStore.current;
      if (resourceStore.resource) _current = previewStore.current;
      return _current;
    });

    const paused = computed(() => {
      if (!active.value) return true;
      if (resourceStore.resource) return previewStore.player.paused;
      if (!trackStore.isMapEmpty()) return trackStore.manager.paused;
      return true;
    });

    const store = computed(() =>
      resourceStore.resource && previewStore.player.active ? previewStore : trackStore
    );
    const pauseResume = () => {
      if (!active.value) return;
      store.value.pauseResume();
    };

    const isInFullScreen = ref(false);
    const panelVisiable = ref(false);
    const { switchFullScreen } = useFullScreen(isInFullScreen, panelVisiable);

    const clickFullScreen = () => {
      if (active.value) switchFullScreen();
    };

    const shortcut = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        pauseResume();
      } else if (e.code === 'KeyA') {
        store.value.jumpTo(0);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (!paused.value) pauseResume();
        store.value.prev();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (!paused.value) pauseResume();
        store.value.next();
      } else if (e.code === 'Escape') {
        clickFullScreen();
      }
    };

    if (!trackStore.isMapEmpty()) {
      window.addEventListener('keydown', shortcut);
      nextTick(() => {
        trackStore.pauseResume();
        trackStore.manager.holdOn();
      });
    }
    watch([() => !!resourceStore.resource, () => !trackStore.isMapEmpty()], (bs: boolean[]) => {
      if (bs[0] || bs[1]) window.addEventListener('keydown', shortcut);
      else window.removeEventListener('keydown', shortcut);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', shortcut);
    });

    const canvas = () => <canvas id={CanvasId} class="mx-auto bg-black" />;
    const content = () => (
      <div class="relative flex items-center h-full" id="canvasContent">
        {canvas()}
      </div>
    );

    /*
          footer panel
        */
    const percent = computed(() => +previewStore.ratio);
    const jumpTo = (value: number) => {
      previewStore.jumpTo(value / 100);
    };

    const footer = () => (
      <div
        id="preview-panel"
        class={[
          active.value ? '' : 'opacity-50',
          isInFullScreen.value ? '' : '',
          'h-full w-full relative flex items-end',
        ]}
      >
        <div class="flex items-center w-full h-full">
          <div
            class={[
              'absolute items-center',
              isInFullScreen.value ? 'flex left-5 leading-none bottom-1/3' : 'flex flex-col left-2',
            ]}
          >
            <div class="active-color">{current.value}</div>
            <div
              class={['border-gray-200', isInFullScreen.value ? 'ml-2 border-l px-1' : 'border-t']}
            >
              {total.value}
            </div>
          </div>

          {isInFullScreen.value ? (
            <Slider
              class={['absolute bottom-1/3 w-2/5 left-1/2 transform -translate-x-3 m-0 mx-2']}
              value={percent.value}
              onChange={jumpTo}
            />
          ) : null}

          <div
            class={[
              'absolute',
              isInFullScreen.value ? 'bottom-1/3' : 'flex left-1/2 text-xl cursor-pointer',
            ]}
            onClick={pauseResume}
          >
            {paused.value ? <CaretRightOutlined /> : <PauseOutlined />}
          </div>

          {isInFullScreen.value ? (
            <div class="absolute bottom-1/3 right-2">
              <FullscreenExitOutlined class="cursor-pointer" onClick={clickFullScreen} />
            </div>
          ) : (
            <div class="absolute flex items-center leading-7 w-15 right-2">
              <button class="mr-2">原始</button>
              <FullscreenOutlined class="cursor-pointer" onClick={clickFullScreen} />
            </div>
          )}
        </div>
      </div>
    );

    return () => (
      <div id={PlayerId} class={'h-full w-full'}>
        {isInFullScreen.value ? (
          <div class={'h-full w-full relative text-white'}>
            <div class={'absolute h-full w-full'}>{canvas()}</div>

            <div class={['absolute bottom-10 h-10 w-full', panelVisiable.value ? '' : 'hidden']}>
              <div
                class="absolute flex w-1/3 h-full px-1 transform -translate-x-1/2 rounded-md left-1/2"
                style="background-color: rgba(84,84,84,.2)"
              >
                {footer()}
              </div>
            </div>
          </div>
        ) : (
          <SectionBox footer title={title.value}>
            {{ content, footer }}
          </SectionBox>
        )}
      </div>
    );
  },
});
</script>

<style lang="less" scoped>
.preview-panel {
  background-color: #272728;
}

:deep(.ant-slider-track),
:deep(.ant-slider:hover .ant-slider-track) {
  background-color: #252528;
  border: solid 2px #6dced7;
}

:deep(.ant-slider-handle) {
  border: solid 2px #fff;
  background-color: #6dced7;
  width: 10px;
  height: 10px;
  margin-top: -3px;
  transition: none;
}

:deep(.ant-slider:hover .ant-slider-handle:not(.ant-tooltip-open)) {
  border: solid 2px #fff;
}

:deep(.ant-slider-handle:focus) {
  box-shadow: none;
}

:deep(.ant-slider-rail),
:deep(.ant-slider:hover .ant-slider-rail) {
  background-color: #252528;
}
</style>
