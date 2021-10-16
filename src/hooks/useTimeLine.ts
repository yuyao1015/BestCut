import type { Ref } from 'vue';

import { setDPI } from '@/utils';
import { clipDurationString, getDurationString } from '@/utils/player';

const SCALE = 5;

export default () => {
  let step = 15;
  let gap = 10;
  let unit = 30;
  let ctx: CanvasRenderingContext2D | null = null;

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
    const canvas = document.getElementById('timeline') as HTMLCanvasElement;
    ctx = canvas.getContext('2d');
    const { clientHeight, clientWidth } = canvas;
    canvas.width = clientWidth;
    canvas.height = clientHeight;
    setDPI(canvas, SCALE);

    drawTimeline();
  };

  const drawTimeline = () => {
    if (!ctx) return;
    let drawLen = 0;
    let count = 0;
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.fillStyle = '#aaa';
    while (drawLen <= width) {
      ctx.beginPath();
      let y = height / 2;
      ctx.strokeStyle = '#777';
      if (count % gap === 0) {
        y = height;
        ctx.strokeStyle = '#fff';

        const s = clipDurationString(getDurationString(unit * count, 30));

        const durationText = s;
        ctx.fillText(durationText, drawLen + 5, y / SCALE - 1);
      }
      ctx.moveTo(drawLen, 0);
      ctx.lineTo(drawLen, y / SCALE);
      ctx.stroke();
      drawLen += step;
      count++;
    }
    ctx.restore();
  };

  const calcUnit = (percent: Ref<number>) => {
    const fps = 30;
    const duration = 1000;

    const x = percent.value;
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
    // console.log(unit, d.toFixed(2));
  };

  return { initTimeLine, drawTimeline, calcUnit };
};
