import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import VueI18n from "vue-i18n";
import messages from "./trads.json";
import {
  af,
  ar,
  az,
  bg,
  ca,
  ckb,
  cs,
  de,
  el,
  en,
  es,
  et,
  fa,
  fi,
  fr,
  he,
  hr,
  id,
  it,
  ja,
  ko,
  lt,
  lv,
  nl,
  no,
  pl,
  pt,
  ro,
  ru,
  sk,
  sl,
  srCyrl,
  sv,
  th,
  tr,
  uk,
  zhHans,
  zhHant,
} from "vuetify/src/locale";

const tradsVuetify = {
  af,
  ar,
  az,
  bg,
  ca,
  ckb,
  cs,
  de,
  el,
  en,
  es,
  et,
  fa,
  fi,
  fr,
  he,
  hr,
  id,
  it,
  ja,
  ko,
  lt,
  lv,
  nl,
  no,
  pl,
  pt,
  ro,
  ru,
  sk,
  sl,
  srCyrl,
  sv,
  th,
  tr,
  uk,
  zhHans,
  zhHant,
};

Vue.use(Vuetify);
Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: "fr",
  fallbackLocale: ["fr"],
  messages: messages,
});

const ops = {
  lang: {
    locales: tradsVuetify,
    current: "fr",
    // t: (key: string, ...params: Array<string>) => i18n.t(key, params)
  }
};

export default new Vuetify({
  ...ops,
  rtl: false,
});
