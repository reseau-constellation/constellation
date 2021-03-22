import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import VueI18n from "vue-i18n";
import messages from "./trads.json";

Vue.use(Vuetify);
Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: "fr",
  fallbackLocale: ["fr"],
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
