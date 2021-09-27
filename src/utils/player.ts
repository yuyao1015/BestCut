function pad(number: number, length: number) {
  const str = '' + number;
  const a = str.split('.');
  while (a[0].length < length) {
    a[0] = '0' + a[0];
  }
  return a.join('.');
}

export function getDurationString(duration: number, fps: number) {
  let neg;
  if (duration < 0) {
    neg = true;
    duration = -duration;
  } else {
    neg = false;
  }

  const h = ~~(duration / 3600);
  duration %= 3600;
  const m = ~~(duration / 60);
  duration %= 60;
  const s = ~~duration;
  duration = duration - ~~duration;

  const f = Math.round(duration * fps);

  const p = (n: number) => pad(n, 2);
  return `${neg ? '-' : ''}${p(h)}:${p(m)}:${p(s)}:${p(f)}`;
}
