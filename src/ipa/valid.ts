import CID from "cids";
import { catégorieVariables } from "./variables";

export type typeRègle = "catégorie" | "bornes" | "valeurCatégorique";

export type règleVariable = {
  typeRègle: typeRègle;
  détails: unknown;
};

export interface règleBornes extends règleVariable {
  type: "bornes";
  détails: {
    val: number | string; //Peut être numérique ou bien le nom d'une autre colonne
    op: ">" | "<" | ">=" | "<=";
  };
}

export interface règleValeurCatégorique extends règleVariable {
  type: "valeurCatégorique";
  détails: {
    ops: unknown[];
  };
}

export interface règleCatégorie extends règleVariable {
  type: "catégorie";
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

export type schémaFonctionValidation = (valeurs: unknown) => erreurValidation[];

export function générerFonctionRègle(
  règle: règleVariable
): schémaFonctionValidation {
  switch (règle.typeRègle) {
    /*case "catégorie":
      return (vals: unknown[]) => {
        return vals
          .filter(v=>!validFichier(v))
          .map(x=>{règle: "catégorie"})
      }*/
    case "bornes":
      const fComp = () => {};
      return (vals: unknown[]) => {
        return [];
      };
    default:
      console.error(`Catégorie ${règle.typeRègle} inconnue.`);
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
