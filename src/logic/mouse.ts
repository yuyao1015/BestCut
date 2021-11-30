type SupportedEvents = string;
// | 'mousemove'
// | 'mousedown'
// | 'mouseup'
// | 'mousewheel'
// | 'DOMMouseScroll'
// | 'mouseover'
// | 'mouseout';

type MouseCallback = (e: MouseEvent) => void;

export class MouseCtl {
  x = 0;
  y = 0;
  w = 0;
  lastX = 0;
  lastY = 0;
  alt = false;
  shift = false;
  ctrl = false;
  buttonRaw = 0;
  over = false;
  dragging = false;
  buttonOnMasks = [0b1, 0b10, 0b100];
  buttonOffMasks = [0b110, 0b101, 0b011];
  active = false;
  bounds: DOMRect | null = null;
  element: HTMLElement;
  eventNames: SupportedEvents[] = [];
  constructor(element: HTMLElement) {
    this.element = (element === undefined ? document : element) as HTMLElement;
    this.addEventListener(['mousedown'], true);

    this.zoomInCallback = () => {};
    this.zoomOutCallback = () => {};
    this.moveOverCallback = () => {};
    this.moveOutCallback = () => {};
    this.downCallback = () => {};
    this.upCallback = () => {};

    this.moveCallback = () => {
      // // global move
      // const left = e.clientX - this.lastX;
      // const top = e.clientY - this.lastY;
      // this.element.style.left = `${left}px`;
      // this.element.style.top = `${top}px`;

      const dx = this.x - this.lastX;
      const dy = this.y - this.lastY;
      const style = getComputedStyle(this.element);
      const { top, left, position } = style;

      if (position === 'static') 'position required';
      this.element.style.left = `${parseInt(left) + dx}px`;
      this.element.style.top = `${parseInt(top) + dy}px`;
    };
  }

  public moveCallback: MouseCallback;
  public zoomInCallback: MouseCallback;
  public zoomOutCallback: MouseCallback;
  public moveOverCallback: MouseCallback;
  public moveOutCallback: MouseCallback;
  public downCallback: MouseCallback;
  public upCallback: MouseCallback;

  eventCallback = (e: any) => this.registerEvent(e);
  registerEvent(e: MouseEvent | WheelEvent) {
    const t = e.type;
    this.bounds = this.element.getBoundingClientRect();
    this.x = e.pageX - this.bounds.left - scrollX;
    this.y = e.pageY - this.bounds.top - scrollY;
    this.alt = e.altKey;
    this.shift = e.shiftKey;
    this.ctrl = e.ctrlKey;
    if (t === 'mousedown') {
      this.buttonRaw |= this.buttonOnMasks[e.buttons - 1];
      this.downCallback(e);
      this.addEventListener(['mousemove', 'mouseup'], false);
    } else if (t === 'mouseup') {
      this.buttonRaw &= this.buttonOffMasks[e.buttons - 1];
      this.upCallback(e);
      this.removeEventListener(['mousemove', 'mouseup'], false);
      this.dragging = false;
    } else if (t === 'mousemove') {
      this.updateMove(e);
    } else if (t === 'mouseover') {
      this.over = true;
      this.moveOverCallback(e);
    } else if (t === 'mouseout') {
      this.over = false;
      this.moveOutCallback(e);
    } else if (t === 'mousewheel') {
      if ('deltaY' in e) this.w = -e.deltaY;
      e.preventDefault();
      this.updateWheel(e);
    } else if (t === 'DOMMouseScroll') {
      this.w = -e.detail;
      e.preventDefault();
      this.updateWheel(e);
    }
  }
  addEventListener(eventNames: SupportedEvents[], self = true) {
    const binder = self ? this.element : window;
    eventNames.forEach((name) => {
      const idx = this.eventNames.indexOf(name);
      if (idx !== -1) return;
      this.eventNames.push(name);
      binder.addEventListener(name, this.eventCallback, { passive: false });
    });
    if (eventNames.length > 0) this.active = true;
  }
  removeEventListener(eventNames: SupportedEvents[], self = true) {
    const binder = self ? this.element : window;
    binder;
    eventNames.forEach((name) => {
      const idx = this.eventNames.indexOf(name);
      this.eventNames.splice(idx, 1);
      window.removeEventListener(name, this.eventCallback);
    });
    if (!this.eventNames.length) this.active = false;
  }
  stopAllListeners(self = true) {
    this.removeEventListener(this.eventNames, self);
    this.active = false;
  }

  updateWheel(e: MouseEvent) {
    if (this.w) {
      if (this.w < 0) {
        this.zoomOutCallback(e);
        if (this.w > 0) this.w = 0;
      } else if (this.w > 0) {
        this.zoomInCallback(e);
        if (this.w < 0) this.w = 0;
      }
    }
  }
  updateMove(e: MouseEvent) {
    if (this.buttonRaw) {
      if (!this.dragging) {
        this.dragging = true;
        this.lastX = this.x;
        this.lastY = this.y;
      } else {
        if (this.buttonRaw & 1) {
          this.moveCallback(e);
        }
      }
    } else {
      if (this.dragging) this.dragging = false;
    }
  }
}
