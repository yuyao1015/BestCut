<script lang="tsx">
import { defineComponent, ref, h, computed } from 'vue';

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
} from '@ant-design/icons-vue';

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
    const active = ref(true);
    const percent = computed(() => props.percent);

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

    const scaleChange = (value: number) => {
      emit('update:percent', value);
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
          const value = Math.max(0, percent.value - 1);
          emit('update:percent', value);
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
          const value = Math.min(100, percent.value + 1);
          emit('update:percent', value);
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

    return () => (
      <div class="flex w-full h-full justify-between mx-2">
        <div class="flex items-center w-1/3">{getTabs(left, 'px-2')}</div>
        <div class="relative flex items-center w-1/3 justify-end">{getTabs(right, 'px-1')}</div>
      </div>
    );
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
</style>
