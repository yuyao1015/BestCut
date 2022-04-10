import type { Ref } from 'vue';

import { usePreviewStore } from './../store/preview';
import { CanvasId, PlayerId } from '@/settings/playerSetting';

export const useFullScreen = (isInFullScreen: Ref<boolean>, panelVisible: Ref<boolean>) => {
  const previewStore = usePreviewStore();

  const fullScreen = async () => {
    if (!isInFullScreen.value) {
      isInFullScreen.value = true;

      previewStore.player.onPlaying = function () {
        const preview = document.getElementById(PlayerId) as HTMLDivElement;
        const { height, width } = getComputedStyle(preview);
        this.setCanvas(document.getElementById(CanvasId) as HTMLCanvasElement);
        if (this.canvas.width < parseInt(width) || this.canvas.height < parseInt(height)) {
          this.canvas.width = parseInt(width);
          this.canvas.height = parseInt(height);
        }
      };
    } else {
      isInFullScreen.value = false;
      previewStore.player.onPlaying = function () {
        this.setCanvas(document.getElementById(CanvasId) as HTMLCanvasElement);
      };
    }
  };

  const switchFullScreen = async () => {
    if (!isInFullScreen.value) {
      const preview = document.getElementById(PlayerId) as HTMLDivElement;
      await preview.requestFullscreen();
    } else if (isInFullScreen.value && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  };

  const showPanel = () => {
    if (!isInFullScreen.value) return;
    panelVisible.value = true;
    setTimeout(() => {
      panelVisible.value = false;
    }, 3000);
  };

  watch(isInFullScreen, (val: boolean) => {
    if (val) window.addEventListener('mousemove', showPanel);
    else window.removeEventListener('mousemove', showPanel);
  });

  onMounted(() => {
    const preview = document.getElementById(PlayerId) as HTMLDivElement;
    preview.addEventListener('fullscreenchange', fullScreen);
  });
  onUnmounted(() => {
    const preview = document.getElementById(PlayerId) as HTMLDivElement;
    preview?.removeEventListener('fullscreenchange', fullScreen);
  });

  return { switchFullScreen };
};
