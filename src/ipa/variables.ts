import { tempsAléatoire } from "./utils";

interface Variable {
  id: string;
  unités: string;
  originale?: string;
}

export async function obtNomsVariable(id: string) {
  await new Promise(resolve => setTimeout(resolve, tempsAléatoire()));

  switch (id) {
    case "xxxdate":
      return { fr: "Date", kaq: "Q'ij" };
    case "xxxpréc":
      return { fr: "Précipitation", kaq: "Jab'" };
    case "xxxtmax":
      return { fr: "Température maximale" };
    case "xxxtmin":
      return { fr: "Température minimale" };
  }
}
