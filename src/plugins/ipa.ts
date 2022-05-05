import _Vue from "vue";

import { proxy } from "@constl/ipa";

const clientProc = proxy.ipa.default;
const clientTravailleur = proxy.ipaTravailleur.default;

const TRAVAILLEUR = false;

export default {
  install(Vue: typeof _Vue): void {
    const idBdCompte = localStorage.getItem("idBdCompte") || undefined;

    const ipa = TRAVAILLEUR ? clientTravailleur : clientProc;
    const client = ipa({ compte: idBdCompte });

    Vue.prototype.$ipa = client;
  },
};
