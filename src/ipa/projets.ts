import { v4 as uuidv4 } from "uuid"
import { l } from "./bds"

const p = [
  {
    id: uuidv4(),
    nom: {
      "fr": "Météorologie"
    },
    bds: l.map(b=>b.id)
  },
  {
    id: uuidv4(),
    nom: {
      "fr": "Un autre exemple"
    },
    bds: l.map(b=>b.id)
  }
]

export async function* obtProjets() {
  for (const i of p) {
    // Pour l'instant, simuler le délai
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i;
  }
}
