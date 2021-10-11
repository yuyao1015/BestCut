<script lang="tsx">
  import { defineComponent, ref, watch, computed, h, onMounted, onUnmounted } from 'vue';
  import {
    CaretRightOutlined,
    PauseOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
  } from '@ant-design/icons-vue';
  import { Slider } from 'ant-design-vue';

  import SectionBox from '@/layouts/SectionBox.vue';
  import { useI18n } from '@/hooks/useI18n';

  import { useResourceStore } from '@/store/resource';
  import { usePlayerStore } from '@/store/player';

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
      const playerStore = usePlayerStore();

      const title = computed(() => {
        const { resource } = resourceStore;
        if (resource)
          return h('div', { class: 'h-full flex items-center' }, [
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

      const paused = computed(() => {
        return active.value ? playerStore.paused : true;
      });
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

      const isInFullScreen = ref(false);
      const fullScreen = async () => {
        if (!isInFullScreen.value) {
          isInFullScreen.value = true;

          playerStore.player.onPlaying = function () {
            const preview = document.getElementById('preview-box') as HTMLDivElement;
            this.canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
            this.ctx = this.canvas.getContext('2d');
            const { height, width } = getComputedStyle(preview);
            if (this.canvas.width < parseInt(width) || this.canvas.height < parseInt(height)) {
              this.canvas.width = parseInt(width);
              this.canvas.height = parseInt(height);
            }
          };
        } else {
          isInFullScreen.value = false;
          playerStore.player.onPlaying = function () {
            this.canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
            this.ctx = this.canvas.getContext('2d');
          };
        }
      };
      const clickFullScreen = async () => {
        if (!active.value) return;
        if (!isInFullScreen.value) {
          const preview = document.getElementById('preview-box') as HTMLDivElement;
          await preview.requestFullscreen();
        } else if (isInFullScreen.value && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      };

      const shortcut = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
          e.preventDefault();
          pauseResume();
        } else if (e.code == 'ArrowLeft') {
          playerStore.prev();
        } else if (e.code == 'ArrowRight') {
          playerStore.next();
        } else if (e.code == 'Escape') {
          clickFullScreen();
        }
      };

      const panelVisiable = ref(false);
      const showPanel = () => {
        if (!isInFullScreen.value) return;
        panelVisiable.value = true;
        // setTimeout(() => {
        //   panelVisiable.value = false;
        // }, 3000);
      };

      const percent = computed(() => +playerStore.ratio);
      const jumpTo = (value: number) => {
        playerStore.jumpTo(value / 100);
      };

      onMounted(() => {
        window.addEventListener('keydown', shortcut);
        window.addEventListener('mousemove', showPanel);
        const preview = document.getElementById('preview-box') as HTMLDivElement;
        preview.addEventListener('fullscreenchange', fullScreen);
      });
      onUnmounted(() => {
        window.removeEventListener('keydown', shortcut);
        window.removeEventListener('mousemove', showPanel);
        const preview = document.getElementById('preview-box') as HTMLDivElement;
        preview.removeEventListener('fullscreenchange', fullScreen);
      });

      const canvas = () => <canvas id="preview-canvas" class="bg-black mx-auto" />;
      const content = () => <div class="h-full flex items-center">{canvas()}</div>;

      const footer = () => (
        <div
          id="preview-panel"
          class={[
            active.value ? '' : 'opacity-50',
            isInFullScreen.value ? '' : '',
            'h-full w-full relative flex items-end',
          ]}
        >
          <div class="h-full w-full flex items-center">
            <div
              class={[
                'absolute items-center',
                isInFullScreen.value
                  ? 'flex left-5 leading-none bottom-1/3'
                  : 'flex flex-col left-2',
              ]}
            >
              <div class="active-color">{current.value}</div>
              <div
                class={[
                  'border-gray-200',
                  isInFullScreen.value ? 'ml-2 border-l px-1' : 'border-t',
                ]}
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
            ) : (
              ''
            )}

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
              <div class="absolute w-15 right-2 flex items-center leading-7">
                <button class="mr-2">原始</button>
                <FullscreenOutlined class="cursor-pointer" onClick={clickFullScreen} />
              </div>
            )}
          </div>
        </div>
      );

      return () => (
        <div id="preview-box" class={'h-full w-full'}>
          {isInFullScreen.value ? (
            <div class={'h-full w-full relative text-white'}>
              <div class={'absolute h-full w-full'}>{canvas()}</div>

              <div class={['absolute bottom-10 h-10 w-full', panelVisiable.value ? '' : 'hidden']}>
                <div
                  class="absolute flex h-full w-1/3 left-1/2 transform -translate-x-1/2 px-1 rounded-md"
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
