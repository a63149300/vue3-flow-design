import { createApp } from 'vue';
import App from './App.vue';
import { registerAntdComp } from './antd';
import * as antIcons from '@ant-design/icons-vue';
import 'ant-design-vue/dist/antd.less';
import '/@/assets/style/index.less';

const app = createApp(App);

// 注册组件
Object.keys(antIcons).forEach((key) => {
  app.component(key, antIcons[key]);
});

registerAntdComp(app);
app.mount('#app');
