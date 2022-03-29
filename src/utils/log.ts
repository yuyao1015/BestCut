export enum LogFlag {
  Track = 1,
  Player = 1 << 1,
  Resource = 1 << 2,
  Timeline = 1 << 3,
}

type LogModule = {
  name: string;
  style: string;
  fn?: (arg?: unknown) => string;
};

const modules: { [prop in LogFlag]: LogModule } = {
  [LogFlag.Track]: {
    name: 'Track',
    style: 'color: rgba(31, 77, 81, 0.5);',
  },
  [LogFlag.Player]: {
    name: 'Player',
    style: 'color: rgba(0, 255, 0, 0.5);',
  },
  [LogFlag.Resource]: {
    name: 'Resource',
    style: 'color: rgba(255, 0, 255, 0.5);',
  },
  [LogFlag.Timeline]: {
    name: 'Timeline',
    style: 'color: rgba(0, 255, 255, 0.7);',
  },
};

class Logger {
  flag: number;
  constructor(flag?: number) {
    this.flag = flag || 0x000f;
  }

  setFlag(flag: number) {
    this.flag = flag;
  }

  addFlag(flag: LogFlag | LogFlag[]) {
    if (!Array.isArray(flag)) flag = [flag];
    flag.forEach((f) => (this.flag |= f));
  }

  removeFlag(flag: LogFlag | LogFlag[]) {
    if (!Array.isArray(flag)) flag = [flag];
    flag.forEach((f) => (this.flag &= ~f));
  }

  config<K extends keyof LogModule>(flag: LogFlag, options: { [P in K]: LogModule[P] }) {
    Object.assign(modules[flag], options);
  }

  log(flag: LogFlag, ...msg: unknown[]) {
    if (!(flag & this.flag)) return;

    const _module = modules[flag];
    let head = _module.name;
    if (_module.fn) head += ' ' + _module.fn();
    console.log(`%c[${head}]: `, _module.style, ...msg);
  }
}

export const logger = new Logger();
