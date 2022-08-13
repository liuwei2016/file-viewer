import Vue from 'vue'
import App from './App.vue'
import VueViewer from 'v-viewer';
import ElementUI from 'element-ui';
import 'viewerjs/dist/viewer.css'
import 'element-ui/lib/theme-chalk/index.css';
Vue.config.productionTip = false
Vue.use(ElementUI);

Vue.use(VueViewer)

new Vue({
  render: h => h(App),
}).$mount('#app')
