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

      <div class="resource-box-mask" v-show="maskVisiable">
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
          v-click-outside:[exclude]="onClickOutside"
        />
        <Track class="resource-drag-view hidden" ref="trackRef" :track="track" />
      </div>
    </div>

    <div v-if="resource.name" class="desc-color text-left text-xs ml-2 mt-1 h-4">
      {{ resource.name }}
    </div>
  </div>
</template>
<script lang="ts">
  import type { ResourceItem } from '@/logic/resource';
  import type { ComponentPublicInstance } from 'vue';

  import {
    defineComponent,
    ref,
    PropType,
    watch,
    nextTick,
    computed,
    onMounted,
    onUnmounted,
    onBeforeMount,
  } from 'vue';

  import ResourceBox from './ResourceBox.vue';
  import Track from '@/components/Track.vue';

  import { setStyle, toggleClass } from '@/utils/dom';
  import { useTrackStore } from '@/store/track';
  import { useResourceStore } from '@/store/resource';
  import { usePreviewStore } from '@/store/preview';

  import { ClickOutside } from '@/directives';

  type DragView = {
    el?: HTMLElement;
    left: string;
    top: string;
  };

  export default defineComponent({
    name: 'Resource',
    components: {
      ResourceBox,
      Track,
    },
    directives: {
      ClickOutside,
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
      const resourceStore = useResourceStore();
      const previewStore = usePreviewStore();
      watch(
        () => trackStore.isResourceOver,
        (val: boolean) => {
          if (!trackRef.value || !maskView || !dragView.el) return;
          const trackView = (trackRef.value.$el || trackRef.value) as HTMLElement;
          if (val) {
            trackStore.setTrack(track.value);

            trackView.style.left = dragView.left;
            trackView.style.top = dragView.top;
            trackView.style.display = 'block';
            dragView.el.style.display = 'none';
            dragView.el = trackView;
          } else {
            maskView.style.left = dragView.left;
            maskView.style.top = dragView.top;
            maskView.style.display = 'block';
            dragView.el.style.display = 'none';
            dragView.el = maskView;
          }
        }
      );

      const maskVisiable = ref(false);
      const maskRef = ref<ComponentPublicInstance | undefined>(undefined);
      const trackRef = ref<ComponentPublicInstance | undefined>(undefined);
      const track = computed(() => {
        const trak = props.resource.toTrack();
        if (trackStore.calcWidth) trak.width = trackStore.calcWidth(trak).width;
        return trak;
      });

      let maskTop = 0;
      let maskView: HTMLElement | undefined;
      let dragView: DragView = { el: maskView, left: '', top: '' };

      const onResourceMove = (e: PointerEvent) => {
        if (maskVisiable.value) return;
        maskVisiable.value = true;

        const resource = e.currentTarget as HTMLElement;
        const rect = resource.getBoundingClientRect();
        let { top, left } = rect;

        maskView = resource.cloneNode(true) as HTMLElement;
        toggleClass(maskView, 'resource-drag-view', true);
        setStyle(maskView, {
          top: top + 'px',
          left: left + 'px',
          width: rect.width + 'px',
          height: rect.height + 'px',
        });
        dragView.el = maskView;
        dragView.top = top + 'px';
        dragView.left = left + 'px';
        maskTop = (document.getElementById('resource-list') as HTMLElement).scrollTop || 0;

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
          setStyle(mask, {
            top: top + 'px',
            left: left + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
          });
        });
      };

      const onResourceLeave = () => {
        maskVisiable.value = false;
        if (maskView) {
          maskView.parentNode?.removeChild(maskView);
          maskView = undefined;
        }
      };

      const onDragStart = () => {
        if (!maskRef.value || !trackRef.value) return;
        const mask = (maskRef.value.$el || maskRef.value) as HTMLElement;
        mask.style.opacity = '0';
        const trackView = (trackRef.value.$el || trackRef.value) as HTMLElement;
        if (maskView) maskView.style.zIndex = '999';
        trackView.style.zIndex = '999';

        window.addEventListener('dragover', onDragOver);
      };

      const onDragOver = (e: DragEvent) => {
        if (!dragView.el) return;
        const rect = dragView.el.getBoundingClientRect();
        dragView.el.style.left = `${e.pageX + (trackStore.isResourceOver ? 0 : -rect.width / 2)}px`;
        dragView.el.style.top = `${e.pageY - rect.height / 2}px`;
      };
      const onDragEnd = () => {
        window.removeEventListener('dragover', onDragOver);
        maskVisiable.value = false;
        if (dragView.el) dragView.el.style.display = 'none';
      };

      // update position when hover in mask
      const updateMaskTop = () => {
        const resourceList = document.getElementById('resource-list') as HTMLElement;
        if (!resourceList || !maskVisiable.value || !maskView) return;
        maskView.style.top = parseInt(dragView.top) + maskTop - resourceList.scrollTop + 'px';
      };
      onMounted(() => {
        window.addEventListener('mousewheel', updateMaskTop, { passive: false });
      });
      onUnmounted(() => {
        window.removeEventListener('mousewheel', updateMaskTop);
      });

      const exclude = ref<Element[]>([]);
      onBeforeMount(() => {
        if (!exclude.value.length) {
          const preview = document.getElementById('preview-box') as HTMLElement;
          const splitters = document.getElementsByClassName('splitter') as HTMLCollection;
          exclude.value = [preview, ...Array.from(splitters)];
        }
      });

      const onClickOutside = () => {
        if (props.resource.active) previewStore.player.stop();
        if (resourceStore.resource) resourceStore.setResource(undefined);
      };

      return {
        maskRef,
        trackRef,
        track,
        maskVisiable,
        exclude,

        onResourceMove,
        onResourceLeave,
        onDragStart,
        onDragEnd,
        onClickOutside,
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
      z-index: -1;
      pointer-events: none;
    }
  }
</style>
