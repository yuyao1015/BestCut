class Writer {
  data: Uint8Array;
  idx: number;
  size: number;
  constructor(size: number) {
    this.data = new Uint8Array(size);
    this.idx = 0;
    this.size = size;
  }

  getData() {
    if (this.idx != this.size) throw 'Mismatch between size reserved and sized used';
    return this.data.slice(0, this.idx);
  }

  writeUint8(value: number) {
    this.data.set([value], this.idx);
    this.idx++;
  }

  writeUint16(value: number) {
    // TODO: find a more elegant solution to endianess.
    const arr = new Uint16Array(1);
    arr[0] = value;
    const buffer = new Uint8Array(arr.buffer);
    this.data.set([buffer[1], buffer[0]], this.idx);
    this.idx += 2;
  }

  writeUint8Array(value: ArrayLike<number>) {
    this.data.set(value, this.idx);
    this.idx += value.length;
  }
}

export function getExtraData(avccBox: any) {
  let i;
  let size = 7;
  for (i = 0; i < avccBox.SPS.length; i++) {
    // nalu length is encoded as a uint16.
    size += 2 + avccBox.SPS[i].length;
  }
  for (i = 0; i < avccBox.PPS.length; i++) {
    // nalu length is encoded as a uint16.
    size += 2 + avccBox.PPS[i].length;
  }

  const writer = new Writer(size);
  writer.writeUint8(avccBox.configurationVersion);
  writer.writeUint8(avccBox.AVCProfileIndication);
  writer.writeUint8(avccBox.profile_compatibility);
  writer.writeUint8(avccBox.AVCLevelIndication);
  writer.writeUint8(avccBox.lengthSizeMinusOne + (63 << 2));

  writer.writeUint8(avccBox.nb_SPS_nalus + (7 << 5));
  for (i = 0; i < avccBox.SPS.length; i++) {
    writer.writeUint16(avccBox.SPS[i].length);
    writer.writeUint8Array(avccBox.SPS[i].nalu);
  }

  writer.writeUint8(avccBox.nb_PPS_nalus);
  for (i = 0; i < avccBox.PPS.length; i++) {
    writer.writeUint16(avccBox.PPS[i].length);
    writer.writeUint8Array(avccBox.PPS[i].nalu);
  }
  return writer.getData();
}

function pad(number: number, length: number) {
  const str = '' + number;
  const a = str.split('.');
  while (a[0].length < length) {
    a[0] = '0' + a[0];
  }
  return a.join('.');
}

export function getDurationString(duration: number, fps: number) {
  if (!duration) return '';
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

export function clipDurationString(duration: string) {
  const ret = '00:00';
  if (!duration) return ret;

  const arr = duration.split(':');
  if (arr.length !== 4) return ret;

  if (+arr[3]) {
    const val = +arr[2] + 1;
    arr[2] = val === 60 ? arr[2] : `${val}`;
  }
  if (+arr[0]) {
    const val = +arr[0] * 60;
    arr[1] = `${+arr[1] + val}`;
  }

  return `${arr[1]}:${arr[2]}`;
}

export function durationString2Sec(duration: string) {
  let ret = 0;
  if (!duration) return ret;
  const arr = duration.split(':');
  const n = arr.length;
  if (n === 2) {
    ret = +arr[0] * 60 + +arr[1];
  } else if (n == 4) {
    ret = +arr[0] * 3600 + +arr[1] * 60 + +arr[2];
  }
  return ret;
}
