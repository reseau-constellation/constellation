import ClientConstellation, { schémaFonctionOublier } from "@/ipa/client";
import {
  MessagePrêtDeTravailleur,
  MessageActionPourTravailleur,
  MessageActionDeTravailleur,
  MessageSuivrePourTravailleur,
  MessageSuivreDeTravailleur,
  MessageSuivrePrêtDeTravailleur,
} from "./ipaParallèle";

let ipa: ClientConstellation;

const dicFOublier: { [key: string]: schémaFonctionOublier } = {};

onmessage = async function ({ data }) {
  console.log("Message reçu par le travailleur", data);

  const extraireFonctionIPA = (fonction: string[]) => {
    if (!ipa) throw Error("IPA non initialisé");

    const erreur = new Error(
      `Fonction ClientConstellation.${fonction.join(".")} n'existe pas.`
    );
    let fonctionIPA:
      | ClientConstellation
      | ClientConstellation[keyof ClientConstellation] = ipa;

    for (const [i, attr] of fonction.entries()) {
      // Vive JavaScript et `this`!
      if (i === fonction.length - 1) {
        if (!fonctionIPA[attr]) throw erreur;
        fonctionIPA =
          fonctionIPA[attr as keyof ClientConstellation].bind(fonctionIPA);
      } else {
        fonctionIPA = fonctionIPA[attr as keyof ClientConstellation];
      }

      if (!fonctionIPA) throw erreur;
    }

    return fonctionIPA;
  };

  const { type } = data;
  switch (type) {
    case "init": {
      const { idBdRacine } = data;
      ipa = new ClientConstellation(idBdRacine);
      await ipa.initialiser();
      const message: MessagePrêtDeTravailleur = {
        type: "prêt",
      };
      // @ts-ignore
      postMessage(message);
      break;
    }
    case "suivre": {
      const { id, fonction, args, iArgFonction } =
        data as MessageSuivrePourTravailleur;
      const fonctionIPA = extraireFonctionIPA(fonction);
      console.log("suivre 1", { fonctionIPA });
      const fFinale = (données: unknown) => {
        const message: MessageSuivreDeTravailleur = {
          type: "suivre",
          id,
          données,
        };
        console.log("fFinale suivre", { message });
        // @ts-ignore
        postMessage(message);
      };

      args.splice(iArgFonction, 0, fFinale);
      console.log("suivre 2", { args });
      const fSuivre: schémaFonctionOublier = await fonctionIPA(...args);
      console.log("suivre 3 (fini)", { fSuivre });
      dicFOublier[id] = fSuivre;
      const message: MessageSuivrePrêtDeTravailleur = {
        type: "suivrePrêt",
        id,
      };
      // @ts-ignore
      postMessage(message);
      break;
    }
    case "action": {
      const { id, fonction, args } = data as MessageActionPourTravailleur;
      const fonctionIPA = extraireFonctionIPA(fonction);
      const résultat = await fonctionIPA(...args);
      const message: MessageActionDeTravailleur = {
        type: "action",
        id,
        résultat,
      };
      //@ts-ignore
      postMessage(message);
      break;
    }
    case "oublier": {
      const { id } = data;
      const fOublier = dicFOublier[id];
      if (fOublier) fOublier();
      delete dicFOublier[id];
      break;
    }
    default: {
      // @ts-ignore
      postMessage({
        erreur: `Type de requète ${type} non reconnu dans message ${data}`,
      });
      break;
    }
  }
};
