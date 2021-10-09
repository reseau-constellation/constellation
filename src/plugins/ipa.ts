import _Vue from "vue";

import estÉlectron from "is-electron";

import clientProc from "@constl/ipa/lib/proxy/ipaProc";
import clientTravailleur from "@constl/ipa/lib/proxy/ipaTravailleur";
import clientConstellationÉlectron from "./clientÉlectronPrincipal";

import { ProxyClientConstellation } from "@constl/ipa/lib/proxy/proxy";

const TRAVAILLEUR = false;

export default {
  install(Vue: typeof _Vue): void {
    const idBdRacine = localStorage.getItem("idBdRacine") || undefined;

    let ipa: (id?: string) => ProxyClientConstellation;
    if (estÉlectron()) {
      ipa = clientConstellationÉlectron;
    } else {
      ipa = TRAVAILLEUR ? clientTravailleur : clientProc;
    }
    const client: ProxyClientConstellation = ipa(idBdRacine);

    Vue.prototype.$ipa = client;
  },
};
