import _Vue from "vue";

import clientProc from "@constl/ipa/lib/proxy/ipaProc";
import clientTravailleur from "@constl/ipa/lib/proxy/ipaTravailleur";

import { ProxyClientConstellation } from "@constl/ipa/lib/proxy/proxy";

const TRAVAILLEUR = false;

export default {
  install(Vue: typeof _Vue): void {
    const idBdRacine = localStorage.getItem("idBdRacine") || undefined;

    const ipa = TRAVAILLEUR ? clientTravailleur : clientProc;
    const client: ProxyClientConstellation = ipa(idBdRacine);
    Vue.prototype.$ipa = client;
  },
};
