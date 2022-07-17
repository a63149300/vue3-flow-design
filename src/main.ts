import { createApp } from 'vue'
import App from './App.vue'
import { registerAntdComp } from '/@/antd';

import('ant-design-vue/dist/antd.less');

const app = createApp(App)
registerAntdComp(app)
app.mount('#app')
