import _Vue from "vue";
import générerClient from "./ipaParallèle";
import IPADirecte from "./ipaDirecte";
import IPATravailleur from "./ipaTravailleur";

const TRAVAILLEUR = false;

export default {
  install(Vue: typeof _Vue): void {
    const idBdRacine = localStorage.getItem("idBdRacine") || undefined;
    const ipa = TRAVAILLEUR ? new IPATravailleur() : new IPADirecte();
    const client = générerClient(ipa, idBdRacine)
    Vue.prototype.$ipa = client;
  },
};
