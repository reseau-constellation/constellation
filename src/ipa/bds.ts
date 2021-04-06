import { v4 as uuidv4 } from "uuid";
import { isValidAddress } from "orbit-db";
import { obtVarsTableau } from "./tableaux";
import { tempsAléatoire } from "./utils";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier
} from "./client";

export default class BDs {
  client: ClientConstellation;
  idBD: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBD = id;
  }

  async suivreBDs(f: schémaFonctionSuivi): Promise<schémaFonctionOublier> {
    return await this.client.suivreBD(this.idBD, async bd => {
      const listeBDs = bd
        .iterator({ limit: -1 })
        .collect()
        .map((e: { [key: string]: any }) => e.payload.value);
      f(listeBDs);
    });
  }

  async créerBD(licence: string): Promise<string> {
    const bdRacine = await this.client.ouvrirBD(this.idBD);
    const idBdBD = await this.client.créerBDIndépendante('kvstore');
    await bdRacine.add(idBdBD);

    const bdBD = await this.client.ouvrirBD(idBdBD);
    await bdBD.set("licence", licence)

    const idBdNoms = await this.client.créerBDIndépendante('kvstore');
    await bdBD.set("noms", idBdNoms)

    const idBdDescr = await this.client.créerBDIndépendante('kvstore');
    await bdBD.set("descriptions", idBdDescr);

    const idBdTableaux = await this.client.créerBDIndépendante('feed');
    await bdBD.set("tableaux", idBdTableaux);

    const idBdMotsClefs = await this.client.créerBDIndépendante('feed');
    await bdBD.set("motsClefs", idBdMotsClefs);

    return idBdBD;
  }

  async ajouterNomsBD(id: string, noms: {[key: string]: string}) {
    const idBdNoms = await this.client.obtIdBd("noms", id)
    const bdNoms = await this.client.ouvrirBD(idBdNoms)
    for (const lng in noms) {
      await bdNoms.set(lng, noms[lng])
    }
  }

  async ajouterDescriptionsBD(id: string, descriptions: {[key: string]: string}) {
    const idBdDescr = await this.client.obtIdBd("descriptions", id)
    const bdDescr = await this.client.ouvrirBD(idBdDescr)
    for (const lng in descriptions) {
      await bdDescr.set(lng, descriptions[lng])
    }
  }

  async suivreLicence(id: string, f: schémaFonctionSuivi) {
    return await this.client.suivreBD(id, async bd => {
      const licence = await bd.get("licence");
      f(licence);
    });
  }

  async suivreNomsBD(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const idBDNoms = await this.client.obtIdBd("noms", id);
    return await this.client.suivreBD(idBDNoms, async bd => {
      let noms = bd.all;
      noms = Object.fromEntries(
        Object.keys(noms).map(x => {
          return [x, noms[x]];
        })
      );
      f(noms);
    });
  }

  async suivreDescrBD(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const idBdDescr = await this.client.obtIdBd("descriptions", id);
    return await this.client.suivreBD(idBdDescr, async bd => {
      let descr = bd.all;
      descr = Object.fromEntries(
        Object.keys(descr).map(x => {
          return [x, descr[x]];
        })
      );
      f(descr);
    });
  }
}

interface BaseDeDonnées {
  id: string;
  nom: string;
  détails: string;
  licence?: string;
  tableaux: string[];
  motsClefs: string[];
}

export const l: BaseDeDonnées[] = [
  {
    id: "fb5c56fc-5cfa-412b-9884-e335638b4a16",
    nom: "xxx",
    licence: "CC-BY-SA-4_0",
    détails: "xxx",
    motsClefs: ["hydrologie", "météorologie"],
    tableaux: [uuidv4(), uuidv4()]
  },
  {
    id: "fb5c56fc-5cfa-412b-9884-e335638b4a17",
    nom: "xxx",
    détails: "xxx",
    motsClefs: [],
    tableaux: [uuidv4(), uuidv4(), uuidv4()]
  },
  {
    id: "fb5c56fc-5cfa-412b-9884-e335638b4a18",
    nom: "xxx",
    licence: "Ma licence",
    détails: "xxx",
    motsClefs: [],
    tableaux: [uuidv4(), uuidv4(), uuidv4()]
  }
];

export async function BDParId(id: string): Promise<BaseDeDonnées | undefined> {
  await new Promise(resolve => setTimeout(resolve, tempsAléatoire()));
  return l.find(bd => bd.id === id);
}

export async function* obtBDs(): AsyncIterator<BaseDeDonnées> {
  for (const i of l) {
    // Pour l'instant, simuler le délai
    await new Promise(resolve => setTimeout(resolve, tempsAléatoire()));
    yield i;
  }
}

export async function obtTableauxBD(id: string) {
  await BDParId(id);
  return [uuidv4(), uuidv4(), uuidv4()];
}

export async function* obtVarsBD(id: string) {
  const tableaux = await obtTableauxBD(id);
  for (const tbl of tableaux) {
    yield* await obtVarsTableau(tbl);
  }
}

export async function obtNomsBD(
  id: string
): Promise<{ [key: string]: string }> {
  await BDParId(id);
  if (id === "fb5c56fc-5cfa-412b-9884-e335638b4a16") {
    return {
      kaq: "Ruwäch q'ij choy Atitlán",
      fr: "Météo lac Atitlán",
      en: "Climate Lake Atitlán"
    };
  } else {
    return {
      த: "பூச்சி மக்கதொகை தேங்காய்",
      fr: "Populations insectes noix de coco",
      en: "Coconut insect populations"
    };
  }
}

export async function obtDétailsBD(
  id: string
): Promise<{ [key: string]: string }> {
  await BDParId(id);
  if (id === "fb5c56fc-5cfa-412b-9884-e335638b4a16") {
    return {
      kaq: "Ruxe'el tzij richin ruwäch q'ij pa ri choy Atitlán",
      fr:
        "Données météorologiques du bassin versant du lac Atitlán au Guatemala",
      en: "Meteorological data from Lake Atitlán watershed, Guatemala"
    };
  } else {
    return {};
  }
}

export async function permissionÉcrire(id: string) {
  const noms = await obtNomsBD(id);
  return noms.kaq === "Ruwäch q'ij choy Atitlán";
}

export async function obtScoreBD(id: string) {
  await BDParId(id);
  const accès = Math.floor(Math.random() * 100);
  const couverture = Math.floor(Math.random() * 100);
  const passe = Math.floor(Math.random() * 100);
  return {
    accès,
    couverture,
    passe,
    total: Math.floor((accès + couverture + passe) / 3)
  };
}

export async function obtAuteursBD(id: string) {
  await BDParId(id);
  return {
    auteurs: ["xxx", "yyy", "zzz"],
    sources: ["www"]
  };
}
