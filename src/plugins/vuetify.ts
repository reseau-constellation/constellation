import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import VueI18n from "vue-i18n";
import { store } from "@/config";
import messages from "./trads.json";

Vue.use(Vuetify);
Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: store.getItem("langue.principale") || "fr",
  // fallbackLocale: JSON.parse(store.getItem("langue.secondaire")) || "fr",
  messages: messages
});

const ops = {
  lang: {
    t: (key: string, ...params: Array<string>) => i18n.t(key, params)
  }
};

export default new Vuetify({
  ops,
  rtl: false
});
