import Vue from 'vue'

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import moment from 'moment'

Object.defineProperty(Vue.prototype, '$moment', { value: moment });

// Install BootstrapVue
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
