import App from './App.vue';

import { registerGlobComp } from '@/components/registerGlobComp';
import { setupRouter } from './router';
import { setupStore } from '@/store';
import { setupI18n } from '@/modules/i18n';
import { setupErrorHandle } from '@/logic/error-handle';

import 'uno.css';
import '@unocss/reset/tailwind.css';
import 'ant-design-vue/dist/antd.css';

async function bootstrap() {
  const app = createApp(App);

  setupStore(app);

  registerGlobComp(app);

  await setupI18n(app);

  setupRouter(app);

  setupErrorHandle(app);

  app.mount('#app', true);
}

bootstrap();
