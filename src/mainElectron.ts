import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify, { i18n } from "./plugins/vuetify";
import VuePlyr from "vue-plyr";
import "vue-plyr/dist/vue-plyr.css";
import clientIPAElectron from "./plugins/ipaÉlectron";

Vue.config.productionTip = false;
Vue.use(clientIPAElectron);
Vue.use(VuePlyr);

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
