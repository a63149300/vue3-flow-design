import { createApp } from 'vue';
import App from './App.vue';
import { registerAntdComp } from './antd';
import { registerIconsComp } from './icons';
import 'ant-design-vue/dist/antd.less';
import '/@/assets/style/index.less';
import Storage from 'vue-lsp';

const app = createApp(App);

// 按需注册ICON组件
registerIconsComp(app);
// 按需注册ant组件
registerAntdComp(app);

app.use(Storage, {
  namespace: 'flow__', // key prefix
  name: 'ls', // name variable [ls] or [$ls],
  storage: 'local', // storage name session, local, memory
});

app.mount('#app');
