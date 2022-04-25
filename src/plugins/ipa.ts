import _Vue from "vue";

import estÉlectron from "is-electron";

import { proxy } from "@constl/ipa";

// import clientConstellationÉlectron from "@/plugins/clientÉlectronPrincipal";

const clientProc = proxy.ipa.default;
const clientTravailleur = proxy.ipaTravailleur.default;

const TRAVAILLEUR = false;

export default {
  install(Vue: typeof _Vue): void {
    const idBdCompte = localStorage.getItem("idBdCompte") || undefined;

    let ipa: (opts: {
      compte?: string;
    }) => proxy.proxy.ProxyClientConstellation;
    if (estÉlectron()) {
      throw "À faire";
      // ipa = clientConstellationÉlectron;
    } else {
      ipa = TRAVAILLEUR ? clientTravailleur : clientProc;
    }
    const client = ipa({ compte: idBdCompte });

    Vue.prototype.$ipa = client;
  },
};
