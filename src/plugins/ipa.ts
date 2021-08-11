import _Vue from "vue";
import ClientConstellation from "@/ipa/client";

export default {
  install(Vue: typeof _Vue): void {
    const idBdRacine = localStorage.getItem("idBdRacine") || undefined;
    Vue.prototype.$ipa = new ClientConstellation(idBdRacine);
    Vue.prototype.$ipa.initialiser();
  },
};
