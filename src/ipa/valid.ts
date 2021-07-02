import CID from "cids";
import { catégorieVariables } from "./variables";

export type typeRègle = "catégorie" | "bornes" | "valeurCatégorique";
export type sourceRègle = "variable" | "tableau";

export type règleVariable = {
  typeRègle: typeRègle;
  détails: unknown;
  source?: sourceRègle;
};

export interface règleBornes extends règleVariable {
  typeRègle: "bornes";
  détails: {
    val: number | string; //Peut être numérique ou bien le nom d'une autre colonne
    op: ">" | "<" | ">=" | "<=";
  };
}

export interface règleValeurCatégorique extends règleVariable {
  typeRègle: "valeurCatégorique";
  détails: {
    options: unknown[];
  };
}

export interface règleCatégorie extends règleVariable {
  typeRègle: "catégorie";
  détails: {
    catégorie: catégorieVariables;
  };
}

export interface Erreur {
  règle: règleVariable;
}

export interface erreurValidation {
  empreinte: string;
  colonne: string;
  erreur: Erreur;
}

export type schémaFonctionValidation = (
  valeurs: élémentDonnées[]
) => erreurValidation[];

export interface élémentDonnées {
  [key: string]: unknown;
  empreinte: string;
}
export function générerFonctionRègle(
  règle: règleVariable,
  colonne: string
): schémaFonctionValidation {
  switch (règle.typeRègle) {
    case "catégorie": {
      return (vals: élémentDonnées[]) => {
        const catégorie = (règle as règleCatégorie).détails.catégorie;
        const nonValides = vals.filter(
          (v) => !ValiderCatégorieVal(v[colonne], catégorie)
        );
        return nonValides.map((v: élémentDonnées) => {
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
      let fComp: (v: élémentDonnées) => boolean;
      let fOp: (v1: number, v2: number) => boolean;

      const { val, op } = (règle as règleBornes).détails;

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
          fComp = (v: élémentDonnées) =>
            fOp(v[colonne] as number, v[val] as number);
          break;
        case "number":
          fComp = (v: élémentDonnées) =>
            fOp(v[colonne] as number, val as number);
          break;
        default:
          throw Error(`Borne de type ${typeof val} non reconnue.`);
      }

      return (vals: élémentDonnées[]) => {
        const nonValides = vals.filter((v) => fComp(v));
        return nonValides.map((v: élémentDonnées) => {
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
      const options = (règle as règleValeurCatégorique).détails.options;
      return (vals: élémentDonnées[]) => {
        const nonValides = vals.filter((v: élémentDonnées) =>
          options.includes(v[colonne])
        );
        return nonValides.map((v: élémentDonnées) => {
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
      throw Error(`Catégorie ${règle.typeRègle} inconnue.`);
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
