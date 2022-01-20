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

      <div class="resource-box-mask absolute top-0 left-0 w-fulll h-full" v-show="maskVisiable">
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
          v-click-outside:[exclude]="resource.active ? onClickOutside : () => {}"
        />
        <Track class="resource-drag-view hidden" ref="trackRef" :track="track" />
      </div>
    </div>

    <div
      v-if="showName(resource) && resource.name"
      class="desc-color text-left text-xs ml-2 mt-1 h-4"
    >
      {{ resource.name }}
    </div>
  </div>
</template>
<script lang="ts">
  import type { ComponentPublicInstance } from 'vue';

  import { defineComponent, ref, PropType, watch, nextTick, computed, onBeforeMount } from 'vue';

  import ResourceBox from './ResourceBox.vue';
  import Track from '@/components/Track.vue';

  import { ResourceItem, TextResource, AudioResource, StickerResource } from '@/logic/resource';
  import { setStyle, toggleClass } from '@/utils/dom';
  import { useTrackStore } from '@/store/track';
  import { useResourceStore } from '@/store/resource';
  import { usePreviewStore } from '@/store/preview';

  import { ClickOutside } from '@/directives';
  import { ContainerType } from '@/enums/track';

  type DragView = {
    el?: HTMLElement;
    left: number;
    top: number;
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
          if (!props.usable) {
            trackStore.setArea(ContainerType.OutSide);
            return;
          }

          const trackView = (trackRef.value.$el || trackRef.value) as HTMLElement;
          if (val) {
            trackStore.setTrack(track.value);

            trackView.style.left = `${dragView.left}px`;
            trackView.style.top = `${dragView.top}px`;
            trackView.style.display = 'block';
            dragView.el.style.display = 'none';
            dragView.el = trackView;
          } else {
            maskView.style.left = `${dragView.left}px`;
            maskView.style.top = `${dragView.top}px`;
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

      let maskView: HTMLElement | undefined;
      let dragView: DragView = { el: maskView, left: 0, top: 0 };

      const onResourceMove = (e: PointerEvent) => {
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
        dragView = { el: maskView, top, left };

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

      const showName = (resource: ResourceItem) => {
        const b1 = resource instanceof TextResource;
        const b2 = resource instanceof AudioResource;
        const b3 = resource instanceof StickerResource;
        return (!b1 && !b2 && !b3) || props.offline;
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
        showName,
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
