import { createApp } from 'vue';

import App from './App.vue';

import { registerGlobComp } from '@/components/registerGlobComp';
import { setupRouter } from '@/router';
import { setupI18n } from '@/locales';

import 'ant-design-vue/dist/antd.css';
import '@/design/tailwind.css';

async function bootstrap() {
  const app = createApp(App);

  registerGlobComp(app);

  await setupI18n(app);

  setupRouter(app);

  app.mount('#app', true);
}

bootstrap();
