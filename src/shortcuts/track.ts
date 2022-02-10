import { useTrackStore } from '@/store/track';

export const trackFocusShortCut = () => {
  let isCtrlPressing = false;
  const trackStore = useTrackStore();

  return {
    onShortcut: (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
      } else if (e.code === 'MetaLeft' || e.code === 'ControlLeft') {
        isCtrlPressing = true;
      } else if (e.code === 'Backspace') {
        if (isCtrlPressing) {
          trackStore.delete();
        }
      }
    },
    offShortcut: () => {
      isCtrlPressing = false;
    },
  };
};
