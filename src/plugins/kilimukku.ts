import { LocaleMessages, LocaleMessage } from "vue-i18n";
import { Kilimukku, dicTraductions } from "@/kilimukku/kilimukku";

import {
  ID_TABLEAU_TRADUCS_OFFICIELLES,
  ID_BD_TRADUCS_OFFICIELLES,
  ID_MOTCLEF_KILIMUKKU_INTERFACE_CONSTELLATION,
} from "@/utils/config";
import { utils } from "@constl/ipa";

const auFormatVi18n = (traducs: dicTraductions): LocaleMessages => {
  type dicFinal = { [clef: string]: LocaleMessage | dicFinal };
  const dicFinalLangue: {
    [langue: string]: dicFinal;
  } = {};

  for (const [clef, traducsClef] of Object.entries(traducs)) {
    const lClefs = clef.split(".");

    for (const [langue, traducLangue] of Object.entries(traducsClef)) {
      if (dicFinalLangue[langue] === undefined) dicFinalLangue[langue] = {};

      let finaleLangueClef = dicFinalLangue[langue];
      for (const c of lClefs.slice(0, -1)) {
        if (!finaleLangueClef[c] || typeof finaleLangueClef[c] === "string")
          finaleLangueClef[c] = {};
        finaleLangueClef = finaleLangueClef[c] as dicFinal;
      }
      finaleLangueClef[lClefs[-1]] = traducLangue;
    }
  }

  return dicFinalLangue;
};

export default async ({
  appli,
  inclureMesSuggestions = true,
}: {
  appli: Vue;
  inclureMesSuggestions?: boolean;
}): Promise<utils.schémaFonctionOublier> => {
  const kilimukku = new Kilimukku({
    constl: appli.$ipa,
    idMotClefProjet: ID_MOTCLEF_KILIMUKKU_INTERFACE_CONSTELLATION,
    sourceOfficielle: {
      idBd: ID_BD_TRADUCS_OFFICIELLES,
      idTableau: ID_TABLEAU_TRADUCS_OFFICIELLES,
    },
    traductionsOriginales: appli.$i18n.messages as dicTraductions,
  });
  appli.$kilimukku = kilimukku;

  const oublierTraductions = await kilimukku.suivreTraductions({
    inclureMesSuggestions,
    f: (traducs) => {
      const traducsPourVi18n: LocaleMessages = auFormatVi18n(traducs);

      // @ts-ignore Là on exagère un peu...mais il n'y a pas d'autre façon !!
      appli.$i18n._vm.$set(appli.$i18n._vm, "messages", traducsPourVi18n);

      console.log("nouveaux messages", appli.$i18n.messages);
    },
  });

  return oublierTraductions;
};
