<script lang="tsx">
  import { defineComponent, ref, h } from 'vue';

  import { Tooltip, Progress } from 'ant-design-vue';
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

  import SectionBox from '@/layouts/SectionBox.vue';
  import { useI18n } from '@/hooks/useI18n';

  export default defineComponent({
    name: '',
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
          component: mouse(),
          tip: '切换鼠标选择状态或切割状态',
          active: true,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: UndoOutlined,
          tip: '撤销',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: RedoOutlined,
          tip: '恢复',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: SplitCellsOutlined,
          tip: '分割',
          active: true,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: DeleteOutlined,
          tip: '删除',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => <div>定格</div>,
          tip: '定格',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: LeftSquareOutlined,
          tip: '倒放',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => <div>镜像</div>,
          tip: '镜像',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: RotateLeftOutlined,
          tip: '旋转',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => <div>裁剪</div>,
          tip: '裁剪',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
      ];

      const percent = ref(50);
      const progress = () => (
        <div class="w-1/3">
          <Progress percent={percent.value} size="small" show-info={false} />
        </div>
      );
      const right = [
        {
          component: () => <div class="h-full">吸附</div>,
          tip: '打开自动吸附',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: () => <div class="h-2/5 mr-3 pr-3 border-r border-black">预览轴</div>,
          tip: '打开预览轴',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: ZoomInOutlined,
          tip: '时间线缩小',
          active: false,
          show: true,
          placement: 'bottomRight',
        },
        {
          component: progress(),
          tip: '',
          active: true,
          show: true,
          placement: '',
        },
        {
          component: ZoomOutOutlined,
          tip: '时间线放大',
          active: false,
          show: true,
          placement: 'bottomLeft',
        },
      ];

      const getTabs = (list: any, style = '') =>
        list.map((tab: any) => (
          <Tooltip class="" placement={tab.placement} title={tab.tip}>
            {h(tab.component, {
              class: [
                'flex items-center cursor-pointer leading-tight',
                style,
                tab.show ? 'block' : 'hidden',
                tab.active ? '' : 'opacity-50',
              ],
            })}
          </Tooltip>
        ));

      const header = () => (
        <div class="flex w-full h-full justify-between mx-2">
          <div class="flex items-center w-1/3">{getTabs(left, 'px-2')}</div>
          <div class="relative flex items-center w-1/3 justify-end">{getTabs(right, 'px-1')}</div>
        </div>
      );

      const sider = () => <div></div>;
      const content = () => <div></div>;

      return () => (
        <SectionBox sider title={title}>
          {{ header, sider, content }}
        </SectionBox>
      );
    },
  });
</script>

<style>
  /* 1 */
</style>
