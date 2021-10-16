<script lang="tsx">
  import type { ComponentPublicInstance } from 'vue';

  import { defineComponent, ref, h, onMounted } from 'vue';

  import { Tooltip, Slider } from 'ant-design-vue';
  import {
    DownOutlined,
    UndoOutlined,
    RedoOutlined,
    SplitCellsOutlined,
    DeleteOutlined,
    LeftSquareOutlined,
    RotateLeftOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    SoundFilled,
    NotificationFilled,
  } from '@ant-design/icons-vue';

  import SectionBox from '@/layouts/SectionBox.vue';
  import TimeLine from './TimeLine.vue';
  import TrackContainer from './TrackContainer.vue';

  import { useI18n } from '@/hooks/useI18n';
  import { getStyle, setStyle } from '@/utils/dom';
  import useTimeLine from '@/hooks/useTimeLine';

  import { mainTrack, audioTrack, list } from './data';

  export default defineComponent({
    name: 'Tracks',
    props: {
      prop: {
        type: Boolean,
        default: false,
      },
    },
    emits: [],
    setup() {
      const { t } = useI18n();
      const title = t('components.tracks');

      const active = ref(true);

      const mouse = () => (
        <div class="h-2/5 border-r border-gray-400">
          <div
            class="flex items-center px-1 rounded-md leading-loose w-16"
            style="background-color: #515154"
          >
            <span class="mr-4">鼠标</span>
            <DownOutlined class="text-xs" />
          </div>
        </div>
      );
      const left = [
        {
          component: mouse,
          tip: '切换鼠标选择状态或切割状态',
          active: true,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => UndoOutlined,
          tip: '撤销',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => RedoOutlined,
          tip: '恢复',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => SplitCellsOutlined,
          tip: '分割',
          active: active.value,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => DeleteOutlined,
          tip: '删除',
          active: active.value,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => <div>定格</div>,
          tip: '定格',
          active: active.value,
          show: active.value,
          placement: 'bottomRight',
        },
        {
          component: () => LeftSquareOutlined,
          tip: '倒放',
          active: active.value,
          show: active.value,
          placement: 'bottomRight',
        },
        {
          component: () => <div>镜像</div>,
          tip: '镜像',
          active: active.value,
          show: active.value,
          placement: 'bottomRight',
        },
        {
          component: () => RotateLeftOutlined,
          tip: '旋转',
          active: active.value,
          show: active.value,
          placement: 'bottomRight',
        },
        {
          component: () => <div>裁剪</div>,
          tip: '裁剪',
          active: active.value,
          show: active.value,
          placement: 'bottomRight',
        },
      ];

      const { calcUnit, drawTimeline, initTimeLine } = useTimeLine();

      const percent = ref(0);
      const scaleChange = (value: number) => {
        percent.value = value;
        calcUnit(percent);
        drawTimeline();
      };
      const progress = (prop: { disabled: boolean }) => (
        <div class="w-1/3">
          <Slider
            class="w-full m-0 mx-1"
            value={percent.value}
            onChange={scaleChange}
            tooltipVisible={false}
            disabled={!prop.disabled}
          />
        </div>
      );
      const right = [
        {
          component: () => <div class="h-full">吸附</div>,
          tip: '打开自动吸附',
          active: true,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => <div class="h-2/5 mr-3 pr-3 border-r border-black">预览轴</div>,
          tip: '打开预览轴',
          active: true,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => ZoomOutOutlined,
          tip: '时间线缩小',
          active: active.value,
          show: true,
          placement: 'bottomRight',
          onClick: () => {
            percent.value = Math.max(0, percent.value - 1);
            calcUnit(percent);
            drawTimeline();
          },
        },
        {
          component: progress,
          tip: '',
          active: active.value,
          show: true,
          placement: '',
        },
        {
          component: () => ZoomInOutlined,
          tip: '时间线放大',
          active: active.value,
          show: true,
          placement: 'bottomLeft',
          onClick: () => {
            percent.value = Math.min(100, percent.value + 1);
            calcUnit(percent);
            drawTimeline();
          },
        },
      ];

      const getTabs = (list: any, style = '') =>
        list.map((tab: any) => {
          const component = h(tab.component({ disabled: tab.active }), {
            class: [
              'flex items-center cursor-pointer leading-tight',
              style,
              tab.show ? 'block' : 'hidden',
              tab.active ? '' : 'opacity-50',
            ],
            onClick: tab.onClick ? tab.onClick : () => {},
          });

          return tab.tip ? (
            <Tooltip class="" placement={tab.placement} title={tab.tip}>
              {component}
            </Tooltip>
          ) : (
            component
          );
        });

      const header = () => (
        <div class="flex w-full h-full justify-between mx-2">
          <div class="flex items-center w-1/3">{getTabs(left, 'px-2')}</div>
          <div class="relative flex items-center w-1/3 justify-end">{getTabs(right, 'px-1')}</div>
        </div>
      );

      const mute = ref(false);
      const onMute = (e: MouseEvent) => {
        e.stopPropagation();
        mute.value = !mute.value;
      };
      const mainTrackHead = () => (
        <div class="text-lg w-full h-full rounded-xl flex items-center justify-center">
          <div
            class="rounded-xl flex items-center justify-center w-14 h-14"
            style="border: 5px solid #313135;background-color: #464649"
            onClick={onMute}
          >
            {!mute.value ? <SoundFilled /> : <NotificationFilled />}
          </div>
        </div>
      );

      const content = () => (
        <div id="tracks-wrapper" ref={tracksWrapperRef} class="relative h-full">
          <TimeLine />

          <div
            ref={tracksRef}
            class="absolute w-full h-full mt-2.5 overflow-y-scroll py-10"
            style={`height: calc(100% - 0.625rem);`}
          >
            <TrackContainer class="video-container overflow-y-auto" list={list} />

            <TrackContainer
              ref={mainTrackRef}
              class={['main-container flex items-center', isSticky.value ? 'sticky-track' : '']}
              list={[[mainTrack]]}
            >
              {mainTrackHead()}
            </TrackContainer>

            <TrackContainer class="audio-container" list={[[audioTrack, audioTrack, audioTrack]]} />
          </div>
        </div>
      );

      const isSticky = ref(false);
      const mainTrackRef = ref<ComponentPublicInstance | null>(null);
      const tracksWrapperRef = ref<ComponentPublicInstance | null>(null);
      const tracksRef = ref<ComponentPublicInstance | null>(null);
      const stickyTrack = () => {
        const main = mainTrackRef.value?.$el;
        const tracks = tracksRef.value?.$el;
        const wrapper = tracksWrapperRef.value?.$el;
        if (!tracks || !wrapper || !main) return;

        const h = parseInt(getStyle(main, 'height'));
        const height = parseInt(getStyle(wrapper, 'height'));

        const videoContainer = tracks.children[0] as HTMLElement;
        const margin = parseInt(getStyle(tracks, 'marginTop'));
        const pad = parseInt(getStyle(tracks, 'paddingTop'));
        const max = height - h - margin - pad;

        setStyle(videoContainer, 'max-height', max + 'px');
        if (tracks.scrollTop === 0 && main.offsetTop - pad === max) {
          isSticky.value = true;
        } else isSticky.value = false;
      };
      const onStickyTrack = (e: WheelEvent) => {
        stickyTrack();
        e.stopPropagation();
      };

      onMounted(() => {
        window.addEventListener('mousewheel', onStickyTrack, { passive: false });
        stickyTrack();

        calcUnit(percent);
        initTimeLine();
      });

      return () => <SectionBox title={title}>{{ header, content }}</SectionBox>;
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-slider-track),
  :deep(.ant-slider:hover .ant-slider-track) {
    background-color: #525155;
    // border: solid 2px #d4d4d4;
    border: solid 2px #fff;
  }

  :deep(.ant-slider-handle) {
    border: solid 2px #fff;
    background-color: #fff;
    width: 10px;
    border-radius: 0;
    border-bottom-right-radius: 50%;
    border-bottom-left-radius: 50%;
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
    background-color: #525155;
  }

  :deep(.ant-slider-disabled),
  :deep(.ant-slider-disabled .ant-slider-handle) {
    cursor: pointer;
  }

  .timeline-locator {
    &-head {
      width: 10px;
      height: 15px;
      transform: translateX(-50%);
      border: solid 2px #fff;
      border-bottom-left-radius: 50%;
      border-bottom-right-radius: 50%;
    }

    &-body {
      height: calc(100% - 15px);
    }
  }

  .sticky-track {
    background-color: rgba(255, 255, 255, 0.1);
    padding-bottom: 15px;
    transition: 100ms all;
  }

  .sticky-track::after {
    position: absolute;
    content: '';
    bottom: 7px;
    left: 128px;
    width: 50%;
    height: 2px;
    background-color: #3a7faf;
  }
</style>
