import { LocaleMessages, LocaleMessage } from "vue-i18n";
import { dicTraductions } from "@/kilimukku/kilimukku";

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
      finaleLangueClef[lClefs[lClefs.length - 1]] = traducLangue;
    }
  }

  return dicFinalLangue;
};

export default async ({
  appli,
  inclureMesSuggestions,
}: {
  appli: Vue;
  inclureMesSuggestions?: boolean;
}) => {
  appli.$kilimukku.établirOriginales(appli.$i18n.messages as dicTraductions);

  const oublierTraductions = await appli.$kilimukku.suivreTraductions({
    inclureMesSuggestions,
    f: (traducs) => {
      const traducsPourVi18n: LocaleMessages = auFormatVi18n(traducs);

      // @ts-ignore Là on exagère un peu...mais il n'y a pas d'autre façon !!
      appli.$i18n._vm.$set(appli.$i18n._vm, "messages", traducsPourVi18n);

    },
  });

  return oublierTraductions;
};
