import type { App } from 'vue';

import {
  // Need
  Button,
  Input,
  Layout,
  Carousel,
  Form,
  Popover,
  Divider,
  Modal,
} from 'ant-design-vue';

const compList = [
  //
  Button,
  Input,
  Layout,
  Carousel,
  Form,
  Popover,
  Divider,
  Modal,
];

export function registerGlobComp(app: App) {
  compList.forEach((component) => {
    // app.component(component.name || component.displayName, component);
    app.use(component);
  });
}
