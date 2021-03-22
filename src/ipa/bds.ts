import { v4 as uuidv4 } from "uuid"

export const l = [
  {
    id: uuidv4(),
    nom: {
      kaq: "Ruwäch q'ij choy Atitlán",
      fr: "Météo lac Atitlán",
      en: "Climate Lake Atitlán"
    },
    motsClefs: ["hydrologie", "météorologie"],
    variables: ["précipitation", "température maximale", "température minimale", "point de rosée"],
    emplacement: ["Guatemala", "Amérique", "Amérique du Nord"],
    tableaux: [
      uuidv4(), uuidv4()
    ]
  },
  {
    id: uuidv4(),
    nom: {
      த: "பூச்சி மக்கதொகை தேங்காய்",
      fr: "Populations insectes noix de coco",
      en: "Coconut insect populations"
    },
    motsClefs: [],
    tableaux: [
      uuidv4(), uuidv4(), uuidv4()
    ]
  }
];

export async function* obtBDs() {
  for (const i of l) {
    // Pour l'instant, simuler le délai
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i;
  }
}

export async function BDParId(id) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return l.find(bd=>bd.id === id)
}
