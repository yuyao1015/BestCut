
/**
 * 所有模型基类
 */
export abstract class Base {
    private id: string;
    private name: string;

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


export enum PropComType {
    TextArea,
    Font,
    Style,
    Slider,
    Select,
    Color,
    File
} 


export interface PropEditInfo {
    editable: boolean;
    edit: {
        component: PropComType;
        props: any;
        checkValid: ((val: any) => boolean | string) | null;
    }
        
    title: string;
    value: any;
}

function uuid() {
    return 'todo';
}

export abstract class ViewItemBorder extends Base {
}

export class ViewItemBorderPureColor extends ViewItemBorder {
    private color: string = '#000';
    private width: number = 1;
    
    getProps(): PropEditInfo[] {
        return [
            {
                editable: true,
                edit: { 
                    component: PropComType.Color,
                    props: null,
                    checkValid: null
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
                        to: 1000
                    },
                    checkValid: null
                },
                title: '颜色',
                value: this.color,
            },
        ];
    }
}

export class ViewItemBorder9Regions extends ViewItemBorder {
    private thumb: string = '';

    getProps(): PropEditInfo[] {
        return [
            {
                editable: true,
                edit: { 
                    component: PropComType.File,
                    props: "*.png;*.jpeg;*.jpg",
                    checkValid: null
                },
                title: '图片',
                value: this.thumb,
            },
        ];
    }
}


export abstract class ViewItem extends Base {
    x: number = 0; // 0~1
    y: number = 0;

    width: number = 0; // 0~1
    height: number = 0;

    rotation: number = 0; //

    border: ViewItemBorder | null = null;
}

export class ViewItemVideo extends ViewItem {
    private path: string;

    constructor(path: string = '') {
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
                    props: "*.mp4",
                    checkValid: null
                },
                title: '路径',
                value: this.path,
            },
        ];
    }
}

export class ViewItemText extends ViewItem {
    private text: string = '未命名';

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
                    }
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
    private duration: number = 20;
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
                    }
                },
                title: '持续时长',
                value: this.duration,
            },
        ];
    }

    abstract transite: (time: number, blobl: any) => any;
}


export class TrackItem extends Base {
    target: TrackItem | null = null;
    postion: number = -1;
    duration: number = 10000;

    getProps() {
        return null;
    }
}

export abstract class TrackItemMedia extends TrackItem {
    refer: {from: number, to: number} | null = null;
    path: string = '';
    muted = false;
}

export class TrackItemVideo extends TrackItemMedia {
    position: number = -1;
    videoId: string = '';

    getProps() {return null;} // todo;
} 

export class TrackItemAudio extends TrackItemMedia {
    position: number = -1;
    audioId: string = '';

    getProps() {return null;} // todo;
}

export class Track {
    items: TrackItem[] = [];
}

