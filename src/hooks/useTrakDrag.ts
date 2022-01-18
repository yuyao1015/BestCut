import type { Ref } from 'vue';
import type { TrackItem } from '@/logic/track';

import { ref } from 'vue';
import _ from 'lodash-es';

import { setStyle } from '@/utils/dom';
import { useTrackStoreWithOut } from '@/store/track';

type DragView = {
  el?: HTMLElement;
  left: number;
  top: number;
};

type Idxes = Ref<{ i: number; j: number }>;

export default (draggedIdxs: Idxes, activeIdxs: Idxes) => {
  let lastX = 0;
  let lastY = 0;
  let traks: HTMLElement;
  const scrollTop = ref(0);
  const trackStore = useTrackStoreWithOut();
  const dragView: DragView = { el: undefined, left: 0, top: 0 };

  const onDragOver = (e: DragEvent) => {
    if (!dragView.el) return;
    dragView.el.style.left = `${dragView.left + e.pageX - lastX}px`;
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

  return {
    dragstart: (e: DragEvent, track: TrackItem, i: number, j: number) => {
      // console.log('start');
      traks = document.getElementById('tracks-wrapper')?.children[0] as HTMLElement;
      if (!traks) return;
      (lastX = e.pageX), (lastY = e.pageY);
      draggedIdxs.value = { i, j };
      activeIdxs.value = { i, j };

      const trak = e.currentTarget as HTMLElement;
      const rect = trak.getBoundingClientRect();
      const { top, left } = rect;

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

      trackStore.setTrack(track);

      traks.addEventListener('scroll', updateScrollTop, true);
      window.addEventListener('dragover', onDragOver);
    },
    dragend: () => {
      // console.log('end');

      draggedIdxs.value = { i: -1, j: -1 };

      window.removeEventListener('dragover', onDragOver);
      traks.removeEventListener('scroll', updateScrollTop);

      if (!dragView.el) return;
      dragView.el.parentNode?.removeChild(dragView.el);
      dragView.el = undefined;
    },
  };
};
