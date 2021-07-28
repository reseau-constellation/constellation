import ClientConstellation from "@/ipa/client";

export default {
  install(Vue: any) {
    const idBdRacine = localStorage.getItem("idBdRacine") || undefined
    Vue.prototype.$ipa = new ClientConstellation(idBdRacine);
    Vue.prototype.$ipa.initialiser();
  },
};
