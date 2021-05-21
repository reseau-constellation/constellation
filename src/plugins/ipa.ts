import ClientConstellation from "@/ipa/client";

export default {
  install(Vue: any) {
    Vue.prototype.$ipa = new ClientConstellation();
    Vue.prototype.$ipa.initialiser();
  },
};
