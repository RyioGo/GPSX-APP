import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";

import router from "./router";

import plugin from "@/libs/plugin";
//  统一管理额外插件包方法
plugin(Vue);

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
