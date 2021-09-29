import { App } from 'vue';
import placeholder from '@/assets/placeholder.png';

function registerImgErrorHandler() {
  window.addEventListener(
    'error',
    function (e: Event) {
      const target = e.target ? e.target : (e.srcElement as any);
      const tagName = target.tagName;
      const times = Number(target?.dataset?.times) || 0;
      const allTimes = 3;

      if (!tagName) return;
      if (tagName.toUpperCase() === 'IMG') {
        if (times >= allTimes) {
          target.src = placeholder;
        } else {
          target.dataset.times = times + 1;
          target.src = placeholder;
        }
      }
    },
    true
  );
}

export function setupErrorHandle(app: App) {
  app;
  registerImgErrorHandler();
}
