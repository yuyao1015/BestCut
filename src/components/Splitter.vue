<template>
  <div ref="spliter" :class="['splitter', vertical ? 'splitterV' : 'splitterH']" />
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted, nextTick } from 'vue';

  export default defineComponent({
    name: 'Splitter',
    props: {
      vertical: {
        type: Boolean,
        default: () => false,
      },
    },
    emits: ['width'],
    setup(props, { emit }) {
      const spliter: any = ref(null);
      const preLay: any = ref(null);
      const afterLay: any = ref(null);

      const spliterOri = ref(0);
      const preSpaceOri = ref(0);
      const afterSpaceOri = ref(0);

      onMounted(() => {
        console.log('======= spliter mounted:', spliter.value);
        nextTick(() => {
          if (!spliter.value) return;
          spliter.value.addEventListener('pointermove', onSpliterMove);
          spliter.value.addEventListener('pointerdown', onSpliterDown);
          spliter.value.addEventListener('pointerup', onSpliterUp);
          let parent: HTMLElement = spliter.value.parentElement as HTMLElement;
          for (let i = 0; i < parent.childElementCount; i++) {
            let cur: HTMLElement = parent.children[i] as HTMLElement;
            if (cur === spliter.value) {
              //TODO 先硬编码一下
              preLay.value = parent.children[i - 1] as HTMLElement;
              afterLay.value = parent.children[i + 1] as HTMLElement;
              break;
            }
          }
        });
      });

      function onSpliterDown(event: PointerEvent) {
        if (props.vertical === false) {
          spliterOri.value = event.clientY;
          preSpaceOri.value = preLay.value.clientHeight;
          afterSpaceOri.value = afterLay.value.clientHeight;
        } else {
          spliterOri.value = event.clientX;
          preSpaceOri.value = preLay.value.clientWidth;
          afterSpaceOri.value = afterLay.value.clientWidth;
        }

        spliter.value.setPointerCapture(event.pointerId);
      }

      function onSpliterMove(event: PointerEvent) {
        if (spliter.value.hasPointerCapture(event.pointerId) === true) {
          if (props.vertical === false) {
            preLay.value.style.height =
              preSpaceOri.value - (spliterOri.value - event.clientY) + 'px';
            afterLay.value.style.height =
              afterSpaceOri.value + (spliterOri.value - event.clientY) + 'px';
          } else {
            // console.log('move');
            const preW = preSpaceOri.value - (spliterOri.value - event.clientX);
            const afterW = afterSpaceOri.value + (spliterOri.value - event.clientX);
            preLay.value.style.width = preW + 'px';
            afterLay.value.style.width = afterW + 'px';
            emit('width', { preW, afterW });
          }
        }
      }

      function onSpliterUp(event: PointerEvent) {
        spliter.value.releasePointerCapture(event.pointerId);
      }
      return { spliter };
    },
  });
</script>

<style scoped>
  .splitterV {
    cursor: col-resize;
    height: 100%;
    width: 10px;
    min-width: 10px;
    max-width: 10px;
  }

  .splitterH {
    cursor: row-resize;
    width: 100%;
    height: 10px;
    min-height: 10px;
    max-height: 10px;
  }

  .splitter {
    background-color: aliceblue;
    display: block;
  }
</style>
