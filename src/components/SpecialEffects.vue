<template>
  <div
    id="pixiContainer"
    class="absolute"
    :style="{
      marginLeft,
      marginTop,
      marginRight: marginLeft,
      marginBottom: marginTop,
      top: appPosition.top + 'px',
      bottom: appPosition.bottom + 'px',
      left: appPosition.left + 'px',
      right: appPosition.right + 'px',
    }"
  ></div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, watch, ref, reactive } from 'vue';

  import { Progress } from 'ant-design-vue';
  import * as PIXI from 'pixi.js';
  import logo from '@/assets/rhino.jpg';
  import { useResourceStore } from '@/store/resource';
  export default defineComponent({
    name: '',
    components: {
      Progress,
    },
    props: {
      applicationOptions: {
        type: Object,
        default: null,
      },
    },
    setup(props) {
      let app = reactive(new PIXI.Application());
      const loader = new PIXI.Loader();
      const resourceStore = useResourceStore();
      let marginLeft = ref('0px');
      let marginTop = ref('0px');
      let { width, height } = props.applicationOptions;
      let appPosition = reactive(props.applicationOptions.position);
      let flag = false;
      const loadCallback = () => {
        const cat = new PIXI.Sprite(loader.resources[logo].texture);
        app.stage.addChild(cat);
      };
      const applicationController = () => {
        loader.add([logo]).load(loadCallback);
      };
      const initApplication = (containerClassName: string) => {
        const applicationOptions: any = {
          antialias: true, // default: false 反锯齿
          backgroundAlpha: 0.8, // default: false 透明度
          resolution: 1,
          ...props.applicationOptions,
        };
        app = new PIXI.Application(applicationOptions);
        const pixiContainer = document.getElementById(containerClassName);
        pixiContainer && pixiContainer.appendChild(app.view);
      };
      const setAppMargin = () => {
        const previewStyle = getComputedStyle(
          document.getElementById('preview-canvas') as HTMLCanvasElement
        );
        const canvasContentStyle = getComputedStyle(
          document.getElementById('canvasContent') as HTMLElement
        );
        marginLeft.value = previewStyle.marginLeft;
        marginTop.value =
          (parseInt(canvasContentStyle.height.slice(0, -2)) -
            parseInt(previewStyle.height.slice(0, -2))) /
            2 +
          'px';
      };
      watch(
        () => resourceStore.resizeProportion,
        () => {
          setAppMargin();
          //第一次默认调整不修改pixiCanvas大小
          if (flag) {
            width *= resourceStore.resizeProportion;
            height *= resourceStore.resizeProportion;
            for (let item in appPosition) {
              appPosition[item] *= resourceStore.resizeProportion;
            }
            console.log(appPosition);
            app.renderer.resize(width, height);
          } else {
            flag = true;
          }
        }
      );
      onMounted(() => {
        initApplication('pixiContainer');
        appPosition = {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          ...appPosition,
        };
      });
      return {
        marginLeft,
        marginTop,
        appPosition,
      };
    },
  });
</script>

<style lang="less" scoped></style>
