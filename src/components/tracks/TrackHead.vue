<script lang="tsx">
import type { Ref } from 'vue';
import { Tooltip, Slider } from 'ant-design-vue';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons-vue';

import { useTrackStore } from '@/store/track';

import * as Tabs from './TrackHeadTabs';
import { isVideo, isAudio, isPicture } from '@/logic/tracks';

type Tab = {
  component: any;
  tip?: string;
  active: Ref<boolean>;
  show: Ref<boolean>;
  placement?:
    | 'left'
    | 'right'
    | 'bottom'
    | 'top'
    | 'bottomRight'
    | 'bottomLeft'
    | 'topLeft'
    | 'topRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom';
};

export default defineComponent({
  name: 'TrackHead',
  props: {
    percent: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update:percent'],
  setup(props, { emit }) {
    const trackStore = useTrackStore();
    const percent = computed(() => props.percent);
    const active = computed(() => !!trackStore.track);
    const isv = computed(() => isVideo(trackStore.track?.type));
    const isa = computed(() => isAudio(trackStore.track?.type));
    const isnp = computed(
      () => isVideo(trackStore.track?.type) && !isPicture(trackStore.track?.type)
    );
    const isMapNotEmpty = computed(() => !trackStore.isMapEmpty());

    const left: Tab[] = [
      {
        component: Tabs.Mouse,
        tip: '切换鼠标选择状态或切割状态',
        active: ref(true),
        show: ref(true),
        placement: 'bottomRight',
      },
      {
        component: Tabs.Undo,
        tip: '撤销',
        active: ref(false),
        show: ref(true),
        placement: 'bottomRight',
      },
      {
        component: Tabs.Redo,
        tip: '恢复',
        active: ref(false),
        show: ref(true),
        placement: 'bottomRight',
      },
      {
        component: Tabs.Split,
        tip: '分割',
        active,
        show: ref(true),
        placement: 'bottomRight',
      },
      {
        component: Tabs.Del,
        tip: '删除',
        active,
        show: ref(true),
        placement: 'bottomRight',
      },
      {
        component: Tabs.Ding,
        tip: '定格',
        active: isnp,
        show: isv,
        placement: 'bottomRight',
      },
      {
        component: Tabs.Revert,
        tip: '倒放',
        active: isnp,
        show: isv,
        placement: 'bottomRight',
      },
      {
        component: Tabs.Mirror,
        tip: '镜像',
        active: isv,
        show: isv,
        placement: 'bottomRight',
      },
      {
        component: Tabs.Rotate,
        tip: '旋转',
        active: isv,
        show: isv,
        placement: 'bottomRight',
      },
      {
        component: Tabs.Clip,
        tip: '裁剪',
        active: isv,
        show: isv,
        placement: 'bottomRight',
      },
      {
        component: Tabs.Point,
        tip: '手动踩点',
        active: isa,
        show: isa,
        placement: 'bottomRight',
      },
    ];

    const zoomout = () => (
      <ZoomOutOutlined
        onClick={() => {
          const value = Math.max(0, percent.value - 1);
          emit('update:percent', value);
        }}
      />
    );

    const scaler = (prop: { disabled: boolean }) => (
      <div class="w-1/3">
        <Slider
          class="w-full m-0 mx-1"
          value={percent.value}
          onChange={(value: number) => {
            emit('update:percent', value);
          }}
          tooltipVisible={false}
          disabled={!prop.disabled}
        />
      </div>
    );

    const zoomin = () => (
      <ZoomInOutlined
        onClick={() => {
          const value = Math.min(100, percent.value + 1);
          emit('update:percent', value);
        }}
      />
    );

    const right: Tab[] = [
      {
        component: Tabs.AutoAttach,
        tip: '打开自动吸附',
        active: ref(true),
        show: ref(true),
        placement: 'bottomRight',
      },
      {
        component: Tabs.TimelineHover,
        tip: '打开预览轴',
        active: ref(true),
        show: ref(true),
        placement: 'bottomRight',
      },
      {
        component: zoomout,
        tip: '时间线缩小',
        active: isMapNotEmpty,
        show: ref(true),
        placement: 'bottomRight',
      },
      {
        component: scaler,
        active: isMapNotEmpty,
        show: ref(true),
      },
      {
        component: zoomin,
        tip: '时间线放大',
        active: isMapNotEmpty,
        show: ref(true),
        placement: 'bottomLeft',
      },
    ];

    const getTabs = (list: Tab[], style = '') =>
      list.map((tab) => {
        const component = h(tab.component({ disabled: tab.active }), {
          class: [
            style,
            tab.show.value ? 'block' : 'hidden',
            tab.active.value ? '' : 'opacity-50 pointer-events-none',
            'flex items-center cursor-pointer leading-tight select-none',
          ],
        });

        return tab.tip ? (
          <Tooltip placement={tab.placement} title={tab.tip} mouseLeaveDelay={0}>
            {component}
          </Tooltip>
        ) : (
          component
        );
      });

    return () => (
      <div class="flex w-full h-full justify-between mx-2">
        <div class="flex items-center w-1/2">{getTabs(left, 'px-2')}</div>
        <div class="relative flex items-center w-1/2 justify-end">{getTabs(right, 'px-1')}</div>
      </div>
    );
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-slider-track),
:deep(.ant-slider:hover .ant-slider-track) {
  background-color: #fff;
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
</style>
