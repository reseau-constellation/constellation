import { v4 as uuidv4 } from "uuid";
import { obtVarsTableau } from "./tableaux";
import { tempsAléatoire } from "./utils";

interface BaseDeDonnées {
  id: string;
  nom: string;
  détails: string;
  licence: string;
  tableaux: string[];
  motsClefs: string[];
}

export const l: BaseDeDonnées[] = [
  {
    id: "fb5c56fc-5cfa-412b-9884-e335638b4a16",
    nom: "xxx",
    licence: "CC-BY-SA-4_0",
    détails: {
      kaq: "Ruxe'el tzij richin ruwäch q'ij pa ri choy Atitlán",
      fr:
        "Données météorologiques du bassin versant du lac Atitlán au Guatemala",
      en: "Meteorological data from Lake Atitlán watershed, Guatemala"
    },
    motsClefs: ["hydrologie", "météorologie"],
    variables: [
      "précipitation",
      "température maximale",
      "température minimale",
      "point de rosée"
    ],
    emplacement: ["Guatemala", "Amérique", "Amérique du Nord"],
    tableaux: [uuidv4(), uuidv4()]
  },
  {
    id: "fb5c56fc-5cfa-412b-9884-e335638b4a17",
    nom: "xxx",
    détails: {},
    motsClefs: [],
    tableaux: [uuidv4(), uuidv4(), uuidv4()]
  },
  {
    id: "fb5c56fc-5cfa-412b-9884-e335638b4a18",
    nom: "xxx",
    licence: "Ma licence",
    détails: {},
    motsClefs: [],
    tableaux: [uuidv4(), uuidv4(), uuidv4()]
  }
];

export async function BDParId(id: string): Promise<BaseDeDonnées> {
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
  const bd = await BDParId(id);
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
