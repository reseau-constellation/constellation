import { v4 as uuidv4 } from "uuid";

const p = [
  {
    id: uuidv4(),
    nom: {
      fr: "Météorologie"
    },
    bds: []
  },
  {
    id: uuidv4(),
    nom: {
      fr: "Un autre exemple"
    },
    bds: []
  }
];

export async function* obtProjets() {
  for (const i of p) {
    // Pour l'instant, simuler le délai
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i;
  }
}
