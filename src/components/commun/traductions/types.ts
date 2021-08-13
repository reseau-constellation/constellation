import { élémentDeMembre } from "@/ipa/réseau";

export type suggestionTrad = élémentDeMembre<élémentBdTraduction>;

export type élémentBdTraduction = {
  clef: string;
  langueSource: string;
  langueCible: string;
  texteOriginal?: string;
  traduction: string;
  date: number;
};
