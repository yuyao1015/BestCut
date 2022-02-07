import { computed, ref } from 'vue';
import {
  DownOutlined,
  UndoOutlined,
  RedoOutlined,
  SplitCellsOutlined,
  DeleteOutlined,
  LeftSquareOutlined,
  RotateLeftOutlined,
} from '@ant-design/icons-vue';
import { useTrackStoreWithOut } from '@/store/track';

const trackStore = useTrackStoreWithOut();

/* ************************************************************************
                              Left Tabs
************************************************************************ */

export const Mouse = () => (
  <div class="border-r border-gray-400">
    <div
      class="flex items-center px-1 rounded-md leading-loose w-16"
      style="background-color: #515154"
    >
      <span class="mr-4">鼠标</span>
      <DownOutlined class="text-xs" />
    </div>
  </div>
);

export const Undo = () => <UndoOutlined class="tab hover:alpha" />;
export const Redo = () => <RedoOutlined class="tab hover:alpha" />;
export const Split = () => <SplitCellsOutlined class="tab hover:alpha" />;
export const Del = () => (
  <DeleteOutlined class="tab hover:alpha" onClick={() => trackStore.delete()} />
);
export const Ding = () => <div class="tab hover:alpha">定格</div>;
export const Revert = () => <LeftSquareOutlined class="tab hover:alpha" />;
export const Mirror = () => <div class="tab hover:alpha">镜像</div>;
export const Rotate = () => <RotateLeftOutlined class="tab hover:alpha" />;
export const Clip = () => <div class="tab hover:alpha">裁剪</div>;
export const Point = () => <div class="tab hover:alpha">手动踩点</div>;

/* ************************************************************************
                              Right Tabs
************************************************************************ */

const isAutoAttach = ref(false);
const attch = () => {
  isAutoAttach.value = !isAutoAttach.value;
};
export const AutoAttach = () => (
  <div
    class={['tab', isAutoAttach.value ? 'bg-black text-blue-300' : 'hover:alpha']}
    onClick={() => attch()}
  >
    吸附
  </div>
);

const hoverVisiable = computed(() => trackStore.hoverVisiable);
export const TimelineHover = () => (
  <div class="mr-3 pr-3 border-r border-gray-800">
    <div
      class={['tab', hoverVisiable.value ? 'bg-black text-blue-300' : 'hover:alpha']}
      onClick={() => trackStore.switchHover()}
    >
      预览轴
    </div>
  </div>
);
