const toString = Object.prototype.toString;

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`;
}

export function isDef<T>(val?: T): val is T {
  return typeof val !== 'undefined';
}

export function isObject(val: any): val is Record<string, any> {
  return val !== null && is(val, 'Object');
}

export function isString(val: unknown): val is string {
  return is(val, 'String');
}

export function isNull(val: unknown): val is null {
  return val === null;
}

export function isArray(val: any): val is Array<any> {
  return val && Array.isArray(val);
}

export function isElement(val: unknown): val is Element {
  return isObject(val) && !!val.tagName;
}

export function isMap(val: unknown): val is Map<any, any> {
  return is(val, 'Map');
}
export function isIterable(val: unknown): val is { [Symbol.iterator]: any } {
  return Symbol.iterator in Object(val);
}

export const isServer = typeof window === 'undefined';
