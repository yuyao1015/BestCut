import type { Ref } from 'vue';

import { setDPI } from '@/utils';
import { TimelineScale, TrackHeadWidth, TimelineTailWidth } from '@/settings/tracksSetting';
import { clipDurationString, getDurationString } from '@/utils/player';

import { useTrackStore } from '@/store/track';

export const useTimeLine = (duration: number, fps: number) => {
  let step = 15; // px per interval
  let gap = 10; // intervals
  let unit = 30; // seconds per interval
  let _scrollLeft = 0; // scrollLeft offset
  let ctx: CanvasRenderingContext2D | null = null;

  const trackStore = useTrackStore();
  trackStore.setTinfo({ unit, step, gap });

  function getScaleUnit(duration: number, fps: number) {
    let ret = 30;
    const half = duration / 2;
    gap = 10;
    if (half >= 60) {
      ret = (half - (half % 60)) / 10;
    } else if (half >= 30) {
      ret = 3;
    } else if (half >= 10) {
      ret = 1;
    } else if (half >= 5) {
      ret = 0.5;
    } else if (half >= 3) {
      ret = 0.3;
    } else if (half >= 1) {
      ret = 0.1;
    } else if (half >= 0.5) {
      ret = 0.1;
      gap = 5;
    } else if (half >= 0.2) {
      ret = 1 / fps;
      gap = 10;
    } else if (half >= 0.05) {
      ret = 1 / fps;
      gap = 3;
      step = Math.max(step, 40);
    } else {
      ret = 1 / fps;
      gap = 2;
    }
    return ret;
  }

  const initTimeLine = () => {
    const canvas = document.getElementById('scaler') as HTMLCanvasElement;
    ctx = canvas.getContext('2d');
    const { clientHeight, clientWidth } = canvas;
    canvas.width = clientWidth + TrackHeadWidth + TimelineTailWidth;
    canvas.height = clientHeight;
    setDPI(canvas, TimelineScale);

    calcUnit(0);
    trackStore.setTinfo({ unit, step, gap });
    drawTimeline(_scrollLeft);
  };

  const drawTimeline = (scrollLeft = 0) => {
    if (!ctx) return;
    const { canvas } = ctx;
    const { width, height } = canvas;
    _scrollLeft = scrollLeft > TrackHeadWidth ? scrollLeft - TrackHeadWidth : 0;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.fillStyle = '#aaa';

    let count = Math.floor(_scrollLeft / step); // index of tick marks
    let drawLen = step * count - _scrollLeft;
    while (drawLen <= width) {
      ctx.beginPath();
      let y = height / 2;
      ctx.strokeStyle = '#777';
      if (count % gap === 0) {
        y = height;
        ctx.strokeStyle = '#fff';

        let d = unit * count;
        if (unit <= 0.1 || gap < 10) {
          const newD = (unit * count) % 1;
          d = newD ? newD : d;
        }

        const ds = getDurationString(d, fps);
        const durationText = clipDurationString(ds);
        ctx.fillText(durationText, drawLen + 5, y / TimelineScale - 1);
      }
      ctx.moveTo(drawLen, 0);
      ctx.lineTo(drawLen, y / TimelineScale);
      ctx.stroke();
      drawLen += step;
      count++;
    }
    ctx.restore();
  };

  const calcUnit = (x: number) => {
    let alpha = duration;
    const f = (x: number) => 1 - Math.sqrt(x / 100);

    if (x > 50 && duration * f(x) > 500) alpha = 500;
    if (x > 90) alpha = 50;
    const d = alpha * f(x);

    const newUnit = getScaleUnit(d, fps);
    if (unit === newUnit) {
      if (step < 50) step += 1;
    } else {
      if (newUnit > 0.1) step = 15;
      unit = newUnit;
    }
  };

  const useUnit = (percent: Ref<number>) => {
    watch(percent, (val: number) => {
      calcUnit(val);
      trackStore.setTinfo({ unit, step, gap });
      drawTimeline(_scrollLeft);
    });
  };

  return { initTimeLine, useUnit, drawTimeline };
};
