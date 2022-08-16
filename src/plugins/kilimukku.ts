import _Vue from "vue";

import { Kilimukku } from "@/kilimukku/kilimukku";

import {
  ID_TABLEAU_TRADUCS_OFFICIELLES,
  ID_BD_TRADUCS_OFFICIELLES,
  ID_MOTCLEF_KILIMUKKU_INTERFACE_CONSTELLATION,
} from "@/utils/config";


export default {
  install(Vue: typeof _Vue): void {
    const kilimukku = new Kilimukku({
      constl: Vue.prototype.$ipa,
      idMotClefProjet: ID_MOTCLEF_KILIMUKKU_INTERFACE_CONSTELLATION,
      sourceOfficielle: {
        idBd: ID_BD_TRADUCS_OFFICIELLES,
        idTableau: ID_TABLEAU_TRADUCS_OFFICIELLES,
      },
      traductionsOriginales: {},
    });
    Vue.prototype.$kilimukku = kilimukku;
  },
};
