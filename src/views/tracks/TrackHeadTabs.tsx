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

const _tab = 'ml-1 p-1 rounded-md';
const hover = 'hover:bg-[rgba(255,255,255,0.3)]';
const ltab = [_tab, hover].join(' ');

/* ************************************************************************
                              Left Tabs
************************************************************************ */

export const Mouse = () => (
  <div class="border-r border-gray-400">
    <div class="flex items-center px-1 rounded-md leading-loose w-16 bg-#515154">
      <span class="mr-4">鼠标</span>
      <DownOutlined class="text-xs" />
    </div>
  </div>
);

export const Redo = () => <RedoOutlined class={ltab} />;
export const Undo = () => <UndoOutlined class={ltab} />;
export const Split = () => <SplitCellsOutlined class={ltab} />;
export const Del = () => <DeleteOutlined class={ltab} onClick={() => trackStore.delete()} />;
export const Ding = () => <div class={ltab}>定格</div>;
export const Revert = () => <LeftSquareOutlined class={ltab} />;
export const Mirror = () => <div class={ltab}>镜像</div>;
export const Rotate = () => <RotateLeftOutlined class={ltab} />;
export const Clip = () => <div class={ltab}>裁剪</div>;
export const Point = () => <div class={ltab}>手动踩点</div>;

/* ************************************************************************
                              Right Tabs
************************************************************************ */

const rtab = 'bg-black text-blue-300';

const isAutoAttach = ref(false);
const attch = () => {
  isAutoAttach.value = !isAutoAttach.value;
};
export const AutoAttach = () => (
  <div class={[_tab, isAutoAttach.value ? rtab : hover]} onClick={() => attch()}>
    吸附
  </div>
);

const hoverVisible = computed(() => trackStore.hoverVisible);
export const TimelineHover = () => (
  <div class="mr-3 pr-3 border-r border-gray-800">
    <div class={[_tab, hoverVisible.value ? rtab : hover]} onClick={() => trackStore.switchHover()}>
      预览轴
    </div>
  </div>
);
