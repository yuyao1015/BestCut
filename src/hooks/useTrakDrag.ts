import type { Ref } from 'vue';
import type { TrackItem } from '@/logic/tracks';

import _ from 'lodash-es';

import { setStyle } from '@/utils/dom';
import { useTrackStore } from '@/store/track';
import { ContainerType } from '@/enums/track';

export const useTrakDrag = (draggedIdxs: Ref<{ i: number; j: number }>) => {
  let lastX = 0;
  let lastY = 0;
  const offset = 0;
  let trak: HTMLElement;
  let traks: HTMLElement;
  let footerContent: HTMLElement;
  let idxs = { i: -1, j: -1 };
  let _area = ContainerType.OutSide;

  const scrollTop = ref(0);
  const scrollLeft = ref(0);
  const trackStore = useTrackStore();
  const dragView: DragView = { el: undefined, left: 0, top: 0 };

  const onDragOver = (e: DragEvent) => {
    if (!dragView.el) return;
    dragView.el.style.left = `${dragView.left + scrollLeft.value + e.pageX - lastX}px`;
    dragView.el.style.top = `${dragView.top + scrollTop.value + e.pageY - lastY}px`;
  };
  const updateScrollTop = () => {
    const fn = () => {
      let overflow = traks.offsetHeight;
      for (let i = 0; i < traks.children.length; i++) {
        overflow -= (traks.children[i] as HTMLElement).offsetHeight;
      }
      scrollTop.value = Math.min(traks.scrollTop, Math.abs(overflow));
    };
    _.debounce(fn, 100)();
  };
  const updateScrollLeft = () => {
    const fn = () => {
      scrollLeft.value = footerContent.scrollLeft;
    };
    _.debounce(fn, 100)();
  };

  onMounted(() => {
    traks = document.getElementById('tracks-wrapper')?.children[0] as HTMLElement;
    traks.addEventListener('scroll', updateScrollTop, true);

    footerContent = document.getElementById('timeline')?.parentNode as HTMLElement;
    footerContent.addEventListener('scroll', updateScrollLeft, true);
  });
  onUnmounted(() => {
    traks.removeEventListener('scroll', updateScrollTop);
    footerContent.removeEventListener('scroll', updateScrollLeft);
  });

  return {
    i() {
      return idxs.i;
    },
    j() {
      return idxs.j;
    },
    lastY() {
      return lastY;
    },
    getOffset() {
      return offset;
    },
    getArea() {
      return _area;
    },
    setArea(area: ContainerType) {
      _area = area;
    },
    lastX() {
      return lastX;
    },
    dragstart: (e: DragEvent, track: TrackItem, i: number, j: number, type: ContainerType) => {
      // console.log('start');
      if (!traks) return;
      (lastX = e.pageX), (lastY = e.pageY);

      trak = e.currentTarget as HTMLElement;
      const rect = trak.getBoundingClientRect();
      const { top, left } = rect;
      trackStore.setOffset(e.pageX - left - 8);

      dragView.el = trak.cloneNode(true) as HTMLElement;
      dragView.left = left;
      dragView.top = top - traks.getBoundingClientRect().top;
      setStyle(dragView.el, {
        width: rect.width + 'px',
        height: rect.height + 'px',
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: '9999',
        margin: '0',
      });

      trak.style.opacity = '0';
      traks.appendChild(dragView.el);

      _area = type;
      idxs = { i, j };
      draggedIdxs.value = { i, j };
      trackStore.setTrack(track);

      window.addEventListener('dragover', onDragOver);
    },
    dragend: () => {
      trackStore.setOffset(0);
      idxs = { i: -1, j: -1 };
      _area = ContainerType.OutSide;
      draggedIdxs.value = { i: -1, j: -1 };

      trak.style.opacity = '';
      window.removeEventListener('dragover', onDragOver);

      dragView.el?.parentNode?.removeChild(dragView.el);
      dragView.el = undefined;
    },
    show() {
      if (trak.style.opacity) trak.style.opacity = '';
    },
  };
};
