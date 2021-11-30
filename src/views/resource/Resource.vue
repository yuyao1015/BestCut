<template>
  <div class="resource-box-wrapper">
    <div :class="['resource', size === '' ? 'h-20 w-36' : 'h-14 w-28']">
      <ResourceBox
        :resource="resource"
        :usable="usable"
        :favorite="favorite"
        :offline="offline"
        :show-add="showAdd"
        @pointermove="onResourceMove"
      />

      <div class="resource-box-mask" v-if="maskVisiable">
        <ResourceBox
          ref="maskRef"
          draggable="true"
          :resource="resource"
          :usable="usable"
          :favorite="favorite"
          :offline="offline"
          :show-add="showAdd"
          @pointerleave="onResourceLeave"
          @dragstart="onDragStart"
          @dragend="onDragEnd"
        />
      </div>
    </div>

    <div v-if="resource.resourceName" class="desc-color text-left text-xs ml-2 mt-1 h-4">
      {{ resource.resourceName }}
    </div>
  </div>
</template>
<script lang="ts">
  import type { ResourceItem } from '#/resource';
  import type { ComponentPublicInstance } from 'vue';

  import { defineComponent, ref, PropType, watch, nextTick } from 'vue';

  import ResourceBox from './ResourceBox.vue';

  import { setStyle, toggleClass } from '@/utils/dom';
  import { useTrackStore } from '@/store/track';

  export default defineComponent({
    name: 'Resource',
    components: {
      ResourceBox,
    },
    props: {
      usable: {
        type: Boolean,
        default: false,
      },
      showAdd: {
        type: Boolean,
        default: false,
      },
      favorite: {
        type: Boolean,
        default: false,
      },
      referenced: {
        type: Boolean,
        default: false,
      },
      offline: {
        type: Boolean,
        default: false,
      },
      size: {
        type: String,
        default: '',
      },
      resource: {
        type: Object as PropType<ResourceItem>,
        default: {},
      },
    },

    setup(props) {
      const checked = ref(props.resource.checked);
      watch(
        () => props.resource.checked,
        () => {
          checked.value = props.resource.checked;
        }
      );

      const trackStore = useTrackStore();
      watch(
        () => trackStore.isResourceOver,
        (val: boolean) => {
          if (val) {
            trackVisiable.value = true;
          } else {
            trackVisiable.value = false;
          }
        }
      );

      const maskVisiable = ref(false);
      const trackVisiable = ref(false);
      const maskRef = ref<ComponentPublicInstance | undefined>(undefined);
      let maskView: HTMLElement | undefined;

      const onResourceMove = (e: PointerEvent) => {
        if (maskVisiable.value) return;
        maskVisiable.value = true;

        const resource = e.currentTarget as HTMLElement;
        const rect = resource.getBoundingClientRect();
        let { top, left } = rect;

        maskView = resource.cloneNode(true) as HTMLElement;
        toggleClass(maskView, 'resource-drag-view', true);
        setStyle(maskView, 'top', `${top}px`);
        setStyle(maskView, 'left', `${left}px`);
        setStyle(maskView, 'width', `${rect.width}px`);
        setStyle(maskView, 'height', `${rect.height}px`);

        let container = (resource.parentNode || document.body) as HTMLElement;

        do {
          if (
            container &&
            container.getBoundingClientRect &&
            (getComputedStyle(container)['transform'] !== 'none' ||
              getComputedStyle(container)['position'] !== 'static')
          ) {
            let containerRect = container.getBoundingClientRect();

            top -= containerRect.top + parseInt(getComputedStyle(container)['borderTopWidth']);
            left -= containerRect.left + parseInt(getComputedStyle(container)['borderLeftWidth']);

            break;
          }
        } while ((container = container.parentNode as HTMLElement));

        nextTick(() => {
          if (!maskRef.value) return;
          const mask = (maskRef.value.$el || maskRef.value) as HTMLElement;
          maskView && mask.parentNode?.appendChild(maskView);

          toggleClass(mask, 'resource-drag', true);
          setStyle(mask, 'top', `${top}px`);
          setStyle(mask, 'left', `${left}px`);
          setStyle(mask, 'width', `${rect.width}px`);
          setStyle(mask, 'height', `${rect.height}px`);
        });
      };

      const onResourceLeave = () => {
        maskVisiable.value = false;
      };

      const onDragStart = (e: DragEvent) => {
        if (!maskRef.value) return;
        const mask = (maskRef.value.$el || maskRef.value) as HTMLElement;
        mask.style.opacity = '0';

        window.addEventListener('dragover', onDragOver);
        e.dataTransfer?.setData('track', '');
      };

      const onDragOver = (e: DragEvent) => {
        if (maskView) {
          const rect = maskView.getBoundingClientRect();
          // maskView.style.left = `${e.pageX + 10}px`;
          maskView.style.left = `${e.pageX - rect.width / 2}px`;
          maskView.style.top = `${e.pageY - rect.height / 2}px`;
        }
      };
      const onDragEnd = () => {
        window.removeEventListener('dragover', onDragOver);
        maskVisiable.value = false;
      };

      return {
        maskRef,
        maskVisiable,
        trackVisiable,

        onResourceMove,
        onResourceLeave,
        onDragStart,
        onDragEnd,
      };
    },
  });
</script>

<style lang="less" scoped>
  .resource-drag {
    transition: none;
    transform: none;
    box-sizing: border-box;
    margin: 0;
    opacity: 1;
    position: absolute;
    z-index: 10000;

    &-view {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
    }
  }
</style>
