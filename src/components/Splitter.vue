<template>
  <div
    ref="spliter"
    :class="[vertical ? 'splitterV' : 'splitterH']"
    bg-black
    :style="splitterStyle"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, computed } from 'vue';

type Props = {
  vertical?: boolean;
  value?: number;
};

const props = withDefaults(defineProps<Props>(), {
  vertical: false,
  value: 10,
});

const emit = defineEmits(['width', 'height']);

const spliter: any = ref(null);
const preLay: any = ref(null);
const afterLay: any = ref(null);

const spliterOri = ref(0);
const preSpaceOri = ref(0);
const afterSpaceOri = ref(0);

onMounted(() => {
  // console.log('======= spliter mounted:', spliter.value);
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
      const pre = preSpaceOri.value - (spliterOri.value - event.clientY);
      const after = afterSpaceOri.value + (spliterOri.value - event.clientY);
      emit('height', { pre, after });
    } else {
      const pre = preSpaceOri.value - (spliterOri.value - event.clientX);
      const after = afterSpaceOri.value + (spliterOri.value - event.clientX);
      emit('width', { pre, after });
    }
  }
}

function onSpliterUp(event: PointerEvent) {
  spliter.value.releasePointerCapture(event.pointerId);
}

const splitterStyle = computed(() => {
  const attr = props.vertical ? 'width' : 'height';
  return {
    [attr]: `${props.value}px`,
    ['min-' + attr]: `${props.value}px`,
    ['max-' + attr]: `${props.value}px`,
  };
});
</script>

<style scoped>
.splitterV {
  cursor: col-resize;
  height: 100%;
}

.splitterH {
  cursor: row-resize;
  width: 100%;
}
</style>
