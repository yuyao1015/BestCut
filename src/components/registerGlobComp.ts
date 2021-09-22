import type { App } from 'vue';

import {
  // Need
  Button,
  Input,
  Form,
  Modal,
} from 'ant-design-vue';

const compList = [
  //
  Button,
  Input,
  Form,
  Modal,
];

export function registerGlobComp(app: App) {
  compList.forEach((component) => {
    // app.component(component.name || component.displayName, component);
    app.use(component);
  });
}
