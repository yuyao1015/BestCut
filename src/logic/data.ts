/**
 * 所有模型基类
 */

import type { PropEditInfo } from '#/viewItem';

import { PropComType } from '@/enums/viewItem';

import { v4 as uuid } from 'uuid';

export abstract class Base {
  public id: string;
  public name: string;

  constructor(name = '未命名', id: string = uuid()) {
    this.id = id;
    this.name = name;
  }

  getId() {
    return this.id;
  }

  setId(id: string) {
    this.id = id;
  }

  getName() {
    return this.name;
  }

  setName(name: string) {
    this.name = name;
  }

  abstract getProps(): any;
}

export abstract class ViewItemBorder extends Base {}

export class ViewItemBorderPureColor extends ViewItemBorder {
  private color = '#000';
  // private width = 1;

  getProps(): PropEditInfo[] {
    return [
      {
        editable: true,
        edit: {
          component: PropComType.Color,
          props: null,
          checkValid: null,
        },
        title: '颜色',
        value: this.color,
      },
      {
        editable: true,
        edit: {
          component: PropComType.Color,
          props: {
            from: 1,
            to: 1000,
          },
          checkValid: null,
        },
        title: '颜色',
        value: this.color,
      },
    ];
  }
}

export class ViewItemBorder9Regions extends ViewItemBorder {
  private thumb = '';

  getProps(): PropEditInfo[] {
    return [
      {
        editable: true,
        edit: {
          component: PropComType.File,
          props: '*.png;*.jpeg;*.jpg',
          checkValid: null,
        },
        title: '图片',
        value: this.thumb,
      },
    ];
  }
}

export abstract class ViewItem extends Base {
  x = 0; // 0~1
  y = 0;

  width = 0; // 0~1
  height = 0;

  rotation = 0; //

  border: ViewItemBorder | null = null;
}

export class ViewItemVideo extends ViewItem {
  private path: string;

  constructor(path = '') {
    super();
    this.path = path;
  }

  getPath() {
    return this.path;
  }

  setPath(path: string) {
    this.path = path;
  }

  getProps(): PropEditInfo[] {
    return [
      {
        editable: true,
        edit: {
          component: PropComType.File,
          props: '*.mp4',
          checkValid: null,
        },
        title: '路径',
        value: this.path,
      },
    ];
  }
}

export class ViewItemText extends ViewItem {
  private text = '未命名';

  constructor() {
    super();
  }

  getText() {
    return this.text;
  }

  setText(text: string) {
    this.text = text;
  }

  getProps(): PropEditInfo[] {
    return [
      {
        editable: true,
        edit: {
          component: PropComType.TextArea,
          props: null,
          checkValid: (text: string) => {
            return text.length > 1 && text.length < 50;
          },
        },
        title: '文本内容',
        value: this.text,
      },
    ];
  }
}

export class ViewItemSprite extends ViewItem {
  constructor() {
    super();
  }

  getProps() {
    return null;
  }
}

export abstract class Effect extends Base {
  private duration = 20;
  constructor() {
    super();
  }

  getProps(): PropEditInfo[] {
    return [
      {
        editable: true,
        edit: {
          component: PropComType.TextArea,
          props: null,
          checkValid: (text: string) => {
            return text.length > 20 && text.length < 100000000;
          },
        },
        title: '持续时长',
        value: this.duration,
      },
    ];
  }

  abstract transit: (time: number, blob: any) => any;
}
