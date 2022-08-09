import { createApp } from 'vue';
import App from './App.vue';
import { registerAntdComp } from './antd';
import { registerIconsComp } from './icons';
import 'ant-design-vue/dist/antd.less';
import '/@/assets/style/index.less';

const app = createApp(App);

// 按需注册ICON组件
registerIconsComp(app);
// 按需注册ant组件
registerAntdComp(app);
app.mount('#app');
