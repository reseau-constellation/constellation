import CID from "cids";
import { catégorieVariables } from "./variables";
import { élémentsBd } from "./client";

export type typeRègle = "catégorie" | "bornes" | "valeurCatégorique";
export type sourceRègle = "variable" | "tableau";

export type règleVariable = {
  typeRègle: typeRègle;
  détails: { [key: string]: élémentsBd };
};

export type règleColonne = {
  règle: règleVariable;
  source: sourceRègle;
  colonne: string;
};

export interface règleBornes extends règleVariable {
  typeRègle: "bornes";
  détails: {
    val: number | string; //Peut être numérique ou bien le nom d'une autre variable
    op: ">" | "<" | ">=" | "<=";
  };
}

export interface règleValeurCatégorique extends règleVariable {
  typeRègle: "valeurCatégorique";
  détails: {
    options: élémentsBd[];
  };
}

export interface règleCatégorie extends règleVariable {
  typeRègle: "catégorie";
  détails: {
    catégorie: catégorieVariables;
  };
}

export interface Erreur {
  règle: règleColonne;
}

export interface erreurValidation {
  empreinte: string;
  erreur: Erreur;
}

export type schémaFonctionValidation<T extends élémentBdListeDonnées> = (
  valeurs: élémentDonnées<T>[]
) => erreurValidation[];

export type élémentBdListeDonnées = {
  [key: string]: élémentsBd;
};

export interface élémentDonnées<
  T extends élémentBdListeDonnées = élémentBdListeDonnées
> {
  données: T;
  empreinte: string;
}
export function générerFonctionRègle<T extends élémentBdListeDonnées>(
  règle: règleColonne,
  varsÀColonnes: { [key: string]: string }
): schémaFonctionValidation<T> {
  const règleVariable = règle.règle;
  const { colonne } = règle;
  const { typeRègle } = règleVariable;

  switch (typeRègle) {
    case "catégorie": {
      return (vals: élémentDonnées<T>[]) => {
        const catégorie = (règleVariable as règleCatégorie).détails.catégorie;
        const nonValides = vals.filter(
          (v) => !ValiderCatégorieVal(v.données[colonne], catégorie)
        );
        return nonValides.map((v: élémentDonnées<T>) => {
          const { empreinte } = v;
          return {
            empreinte,
            colonne,
            erreur: { règle },
          };
        });
      };
    }

    case "bornes": {
      let fComp: (v: élémentDonnées<T>) => boolean;
      let fOp: (v1: number, v2: number) => boolean;

      const { val, op } = (règleVariable as règleBornes).détails;

      switch (op) {
        case ">":
          fOp = (v1: number, v2: number) => v1 > v2;
          break;
        case "<":
          fOp = (v1: number, v2: number) => v1 < v2;
          break;
        case ">=":
          fOp = (v1: number, v2: number) => v1 >= v2;
          break;
        case "<=":
          fOp = (v1: number, v2: number) => v1 <= v2;
          break;
      }

      switch (typeof val) {
        case "string":
          fComp = (v: élémentDonnées<T>) =>
            fOp(
              v.données[colonne] as number,
              v.données[varsÀColonnes[val]] as number
            );
          break;
        case "number":
          fComp = (v: élémentDonnées<T>) =>
            fOp(v.données[colonne] as number, val as number);
          break;
        default:
          throw Error(`Borne de type ${typeof val} non reconnue.`);
      }

      return (vals: élémentDonnées<T>[]) => {
        const nonValides = vals.filter((v) => fComp(v));
        return nonValides.map((v: élémentDonnées<T>) => {
          const { empreinte } = v;
          return {
            empreinte,
            colonne,
            erreur: { règle },
          };
        });
      };
    }

    case "valeurCatégorique": {
      const options = (règleVariable as règleValeurCatégorique).détails.options;
      return (vals: élémentDonnées<T>[]) => {
        const nonValides = vals.filter((v: élémentDonnées<T>) =>
          options.includes(v.données[colonne])
        );
        return nonValides.map((v: élémentDonnées<T>) => {
          const { empreinte } = v;
          return {
            empreinte,
            colonne,
            erreur: { règle },
          };
        });
      };
    }
    default:
      throw Error(`Catégorie ${typeRègle} inconnue.`);
  }
}

export const formatsFichiers = {
  images: [
    "webp",
    "svg",
    "png",
    "jpg",
    "jpeg",
    "jfif",
    "pjpeg",
    "pjp",
    "gif",
    "avif",
    "apng",
  ],
  vidéo: ["mp4"],
  audio: ["mp3", "ogg", "m4a"],
};

function validFichier(val: unknown, exts?: string[]): boolean {
  if (typeof val !== "object") return false;
  const { cid, ext } = val as { cid: string; ext: string };
  if (!CID.isCID(cid)) return false;
  if (typeof ext !== "string") return false;
  if (exts) {
    return exts.includes(ext);
  }
  return true;
}

export function ValiderCatégorieVal(
  val: unknown,
  catégorie: catégorieVariables
): boolean {
  if (val === undefined) return true; //Permettre les valeurs manquantes

  switch (catégorie) {
    case "numérique":
      return typeof val === "number";
    case "date":
      return true;
    case "heure":
      return true;
    case "dateEtHeure":
      return true;
    case "chaîne":
      return typeof val === "string";
    case "catégorique":
      return true;
    case "booléen":
      return typeof val === "boolean";
    case "géojson":
      return typeof val === "object";
    case "vidéo":
      return validFichier(val, formatsFichiers.vidéo);
    case "audio":
      return validFichier(val, formatsFichiers.audio);
    case "photo":
      return validFichier(val, formatsFichiers.images);
    case "fichier":
      return validFichier(val);
    default:
      return false;
  }
}
