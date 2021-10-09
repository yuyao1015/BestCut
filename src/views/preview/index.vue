<script lang="tsx">
  import { defineComponent, ref, watch, computed, h, onMounted, onUnmounted } from 'vue';
  import {
    CaretRightOutlined,
    PauseOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
  } from '@ant-design/icons-vue';
  import SectionBox from '@/layouts/SectionBox.vue';
  import Progress from '@/components/Progress.vue';
  import { useI18n } from '@/hooks/useI18n';

  import { useResourceStore } from '@/store/resource';
  import { usePlayerStore } from '@/store/player';

  export default defineComponent({
    name: '',
    components: {
      SectionBox,
      Progress,
      CaretRightOutlined,
      PauseOutlined,
      FullscreenOutlined,
      FullscreenExitOutlined,
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
        // if (!active.value) return;
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

      onMounted(() => {
        window.addEventListener('keydown', shortcut);
        const preview = document.getElementById('preview-box') as HTMLDivElement;
        preview.addEventListener('fullscreenchange', fullScreen);
      });
      onUnmounted(() => {
        window.removeEventListener('keydown', shortcut);
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
            isInFullScreen.value ? '' : 'mt-6',
            'h-full w-full relative flex item-center',
          ]}
        >
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
            <Progress
              class={['absolute bottom-1/3 w-1/2 left-1/2 transform -translate-x-3']}
              percent={50}
            />
          ) : (
            ''
          )}

          <div
            class={[
              'absolute',
              isInFullScreen.value ? 'bottom-1/3' : 'flex left-1/2 text-xl cursor-pointer top-2',
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
            <div class="absolute w-15 right-2 top-1 flex items-center leading-7">
              <button class="mr-2">原始</button>
              <FullscreenOutlined class="cursor-pointer" onClick={clickFullScreen} />
            </div>
          )}
        </div>
      );

      return () => (
        <div id="preview-box" class={'h-full w-full'}>
          {isInFullScreen.value ? (
            <div class={'h-full w-full relative text-white'}>
              <div class={'absolute h-full w-full'}>{canvas()}</div>

              <div class={'absolute bottom-10 h-10 w-full'}>
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
</style>
