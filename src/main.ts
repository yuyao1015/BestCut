import { createApp } from 'vue';

import App from './App.vue';

import { registerGlobComp } from '@/components/registerGlobComp';
import { setupRouter } from '@/router';

import 'ant-design-vue/dist/antd.css';

const app = createApp(App);

registerGlobComp(app);

setupRouter(app);

app.mount('#app', true);
