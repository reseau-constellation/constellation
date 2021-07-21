export type valsJSON =
  | number
  | string
  | boolean
  | valsJSON[]
  | { [key: string]: valsJSON };
export type élément = { [key: string]: valsJSON };
export type DonnéesJSON = élément | élément[];

export type clefsExtraction = (string | number)[];
/*
function extraireDonnées<T>(données: DonnéesJSON, clefs: clefsExtraction): T {
  let temp: DonnéesJSON | T = données;

  for (const c of clefs) {
    if (typeof c === "number") {
      if (!Array.isArray(temp)) throw Error("Erreur d'indexe");
      temp = temp[c];
    } else if (typeof c === "string") {
      if (typeof temp !== "object") throw Error("Erreur d'indexe");
      temp = temp[c];
    }
  }

  return temp;

}

export default async function importerDonnéesJSON(
  donnéeesJSON: DonnéesJSON,
  clefsÉléments: { [key: string]: clefsExtraction },
  clefsRacine: clefsExtraction = []
): Promise<élément[]> {
  const racine = extraireDonnées<élément[]>(donnéeesJSON, clefsRacine);
  const éléments: élément[] = [];

  for (const é of racine) {
    // Pour chaque élément de la racine...
    const élm: élément = {}; // Notre nouvel élément (vide pour l'instant)
    for (const [variable, l_clefs] of Object.entries(clefsÉléments)) {
      // Extraire la valeur de la variable
      const val = extraireDonnées<valsJSON>(é, l_clefs);
      élm[variable] = val;
    }

    éléments.push(élm);
  }

  return éléments;
}
  */
