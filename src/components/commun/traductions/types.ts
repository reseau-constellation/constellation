import { réseau } from "@constl/ipa";

export const ID_VAR_CLEF =
  "/orbitdb/zdpuAximNmZyUWXGCaLmwSEGDeWmuqfgaoogA7KNSa1B2DAAF/dd77aec3-e7b8-4695-b068-49ce4227b360";
export const ID_VAR_LANGUE_SOURCE =
  "/orbitdb/zdpuAshZMdYeDD7PfJzjGrfwfCSFSJdTAVh72sFByYUuUoFbh/a6b7359e-3661-46af-965b-06023ed39d15";
export const ID_VAR_LANGUE_CIBLE =
  "/orbitdb/zdpuAsV9tm4QSa5nrcmzFGHjfuv1hGmfC9PTPTHFnWRTajNcs/3d0616b1-99f5-4041-95c1-94b30cd0472b";
export const ID_VAR_TEXTE_ORIGINAL =
  "/orbitdb/zdpuAr8AqnQhqWsATnZTThsCK41wNLtRheXHqR81jSS8q9Dck/bfea0d03-5ee2-4e4c-8ad9-21a783012f7e";
export const ID_VAR_TRADUCTION =
  "/orbitdb/zdpuB2aXkMVoPxyG9xpfDdCUhJpD8jWHe49BjY3JmddVAHXQ7/ac313db8-f5c0-4d57-ba5b-e4d6fe119b6d";
export const ID_VAR_DATE =
  "/orbitdb/zdpuAkfSVLrNUdbXjWifzuUM5vvWhLBThGTqshuJJUY8yphtF/3e801a45-ddb1-416b-b1aa-9af613e300da";

export const ID_COL_CLEF = "clef";
export const ID_COL_LANGUE_SOURCE = "langue source";
export const ID_COL_LANGUE_CIBLE = "langue cible";
export const ID_COL_TEXTE_ORIGINAL = "texte original";
export const ID_COL_TRADUCTION = "traduction";
export const ID_COL_DATE = "date";

export type suggestionTrad = réseau.élémentDeMembre<élémentBdTraduction>;

export type élémentBdTraduction = {
  [ID_COL_CLEF]: string;
  [ID_COL_LANGUE_SOURCE]: string;
  [ID_COL_LANGUE_CIBLE]: string;
  [ID_COL_TEXTE_ORIGINAL]?: string;
  [ID_COL_TRADUCTION]: string;
  [ID_COL_DATE]: number;
};
