import { isObject, isServer } from './is';
import { camelize } from '@vue/shared';

export const on = function (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject,
  useCapture = false
): void {
  if (element && event && handler) {
    element?.addEventListener(event, handler, useCapture);
  }
};

export const off = function (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject,
  useCapture = false
): void {
  if (element && event && handler) {
    element?.removeEventListener(event, handler, useCapture);
  }
};

type CSSStyleDeclarationString = Omit<
  CSSStyleDeclaration,
  | number
  | 'item'
  | 'length'
  | 'getPropertyPriority'
  | 'getPropertyValue'
  | 'removeProperty'
  | 'setProperty'
  | 'parentRule'
>;

export const getStyle = function (element: HTMLElement, styleName: string): string {
  if (isServer) return '';
  if (!element || !styleName) return '';
  let name = camelize(styleName) as keyof CSSStyleDeclarationString;
  if (name === 'float') {
    name = 'cssFloat';
  }
  try {
    const style = element.style[name];
    if (style) return style;
    const computed = document.defaultView ? document.defaultView.getComputedStyle(element, '') : '';
    return computed ? computed[name] : '';
  } catch (e) {
    return element.style[name];
  }
};

export function setStyle(
  element: HTMLElement,
  styleName: CSSStyleDeclaration | string,
  value?: string
): void {
  if (!element || !styleName) return;

  if (isObject(styleName)) {
    Object.keys(styleName).forEach((prop: keyof CSSStyleDeclarationString) => {
      setStyle(element, prop, styleName[prop]);
    });
  } else {
    const name = camelize(styleName) as keyof CSSStyleDeclarationString;
    element.style[name] = value ? value : '';
  }
}
