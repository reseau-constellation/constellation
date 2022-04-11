import _Vue from "vue";

import estÉlectron from "is-electron";

import { proxy } from "@constl/ipa";

import clientConstellationÉlectron from "./clientÉlectronPrincipal";

const clientProc = proxy.ipa.default;
const clientTravailleur = proxy.ipaTravailleur.default;
const { ProxyClientConstellation } = proxy.proxy

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
