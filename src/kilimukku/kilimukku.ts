import _Vue from "vue";

import { accès, utils, client, réseau, bds, valid } from "@constl/ipa";

export interface TraductionOriginale {
  clef: string;
  langueCible: string;
  traduction: string;
  empreinte: string;
}

export interface TraductionRéseau extends TraductionOriginale {
  date: Date;
  auteur: string;
  langueSource: string;
  texteOriginal?: string;
}

export const ID_VAR_CLEF =
  "/orbitdb/zdpuAt9PVUHGEyrL43tWDmpBUrgoPPWZHX7AGXWk4ZhEZ1oik/841abe65-93f5-4539-b721-2f8085a18cc5";
export const ID_VAR_LANGUE_SOURCE =
  "/orbitdb/zdpuB1TEfuUWUQ2dPf8PHQFCg5n3zzx2xRhmimdF7tv6SSu9s/c15da84d-15bf-44da-9827-74d2857ff339";
export const ID_VAR_LANGUE_CIBLE =
  "/orbitdb/zdpuAtmGaeNicerk2ByPa4oQMtSPgdNovQp6ZC6c2fJqF64Sb/6462ccb9-25ca-44e5-b81a-ea6d5df09709";
export const ID_VAR_TEXTE_ORIGINAL =
  "/orbitdb/zdpuAyBg5f4Lxabv7YHVrxpNbBQW6dzxwH6wfQVMKZjECnkry/f536d48e-e040-48bf-9efb-539321804f4f";
export const ID_VAR_TRADUCTION =
  "/orbitdb/zdpuAnEhqhCW51yfohfHWzjLgDPyuY2ySVmTBW7upAidVbwnX/954f02c8-e2ea-433b-89e2-6e670fd8873b";
export const ID_VAR_DATE =
  "/orbitdb/zdpuAtyjCoieAwksiuuvaYgVQfzFYSsB4isz5LuJqiiEnVdfS/283c823e-24ad-4881-9782-99fc753e5161";
export const ID_VAR_CONTRIB = "";

export const ID_COL_CLEF = "clef";
export const ID_COL_LANGUE_SOURCE = "langue source";
export const ID_COL_LANGUE_CIBLE = "langue cible";
export const ID_COL_TEXTE_ORIGINAL = "texte original";
export const ID_COL_TRADUCTION = "traduction";
export const ID_COL_DATE = "date";
export const ID_COL_AUTEUR = "auteur";

export const ID_MOTCLEF_TRAD =
  "/orbitdb/zdpuAoNDXakfzK2DxJAozuR2V9TYha5bvzjQHN5VnAm4jvL6S/736889ad-a29b-4e6f-94fa-a78f8e92978d";
export const ID_MOTCLEF_SUGGESTIONS_KILIMUKKU =
  "/orbitdb/zdpuAsViPqnpRhUwN6kL7cSyLFaxSEkK233cJAChJMtc2vwLT/fe6ab45c-dd39-4ca9-a695-f151d922704f";
export const idUniqueTableauSuggestionsKilimukku = "trads";

export const schémaBdKilimukku: bds.schémaSpécificationBd = {
  motsClefs: [ID_MOTCLEF_TRAD, ID_MOTCLEF_SUGGESTIONS_KILIMUKKU],
  licence: "ODbl-1_0",
  tableaux: [
    {
      clef: "trads",
      cols: [
        {
          idVariable: ID_VAR_CLEF,
          idColonne: ID_COL_CLEF,
        },
        {
          idVariable: ID_VAR_LANGUE_SOURCE,
          idColonne: ID_COL_LANGUE_SOURCE,
        },
        {
          idVariable: ID_VAR_LANGUE_CIBLE,
          idColonne: ID_COL_LANGUE_CIBLE,
        },
        {
          idVariable: ID_VAR_TEXTE_ORIGINAL,
          idColonne: ID_COL_TEXTE_ORIGINAL,
        },
        {
          idVariable: ID_VAR_TRADUCTION,
          idColonne: ID_COL_TRADUCTION,
        },
        {
          idVariable: ID_VAR_DATE,
          idColonne: ID_COL_DATE,
        },
      ],
    },
  ],
};

export type élémentBdSuggestion = {
  [ID_COL_CLEF]: string;
  [ID_COL_LANGUE_SOURCE]: string;
  [ID_COL_LANGUE_CIBLE]: string;
  [ID_COL_TEXTE_ORIGINAL]?: string;
  [ID_COL_TRADUCTION]: string;
  [ID_COL_DATE]: number;
};

export type élémentBdCentraleTraduction = élémentBdSuggestion & {
  [ID_COL_AUTEUR]: string;
};

export type dicTraductionsLangue = {
  [langue: string]: dicTraductionsLangue | string;
};
export type dicTraductions = { [clef: string]: dicTraductionsLangue };

const élémentBdTradÀRésultatTrad = (
  élément: valid.élémentDonnées<élémentBdCentraleTraduction>
): TraductionRéseau => {
  return {
    clef: élément.données[ID_COL_CLEF],
    date: new Date(élément.données[ID_COL_DATE]),
    auteur: élément.données[ID_COL_AUTEUR],
    traduction: élément.données[ID_COL_TRADUCTION],
    texteOriginal: élément.données[ID_COL_TEXTE_ORIGINAL],
    langueSource: élément.données[ID_COL_LANGUE_SOURCE],
    langueCible: élément.données[ID_COL_LANGUE_CIBLE],
    empreinte: élément.empreinte,
  };
};

const élémentBdSuggestionÀRésultatTrad = (
  élément: valid.élémentDonnées<élémentBdSuggestion>,
  auteur: string
): TraductionRéseau => {
  return {
    clef: élément.données[ID_COL_CLEF],
    date: new Date(élément.données[ID_COL_DATE]),
    auteur,
    traduction: élément.données[ID_COL_TRADUCTION],
    texteOriginal: élément.données[ID_COL_TEXTE_ORIGINAL],
    langueSource: élément.données[ID_COL_LANGUE_SOURCE],
    langueCible: élément.données[ID_COL_LANGUE_CIBLE],
    empreinte: élément.empreinte,
  };
};

export class Kilimukku {
  constl: client.default;
  idTableauOfficiel: string;
  idBdOfficielle: string;
  idMotClefProjet: string;
  traductionsOriginales: dicTraductions;
  schémaBdSuggestions: bds.schémaSpécificationBd;
  _traductionsOriginalesSelonClefs: {
    [clef: string]: { [langue: string]: string };
  };

  constructor({
    constl,
    idMotClefProjet,
    sourceOfficielle,
    traductionsOriginales,
  }: {
    constl: client.default;
    idMotClefProjet: string;
    sourceOfficielle: { idBd: string; idTableau: string };
    traductionsOriginales?: dicTraductions;
  }) {
    this.constl = constl;
    this.idMotClefProjet = idMotClefProjet;
    this.idBdOfficielle = sourceOfficielle.idBd;
    this.idTableauOfficiel = sourceOfficielle.idTableau;
    this.traductionsOriginales = traductionsOriginales || {};

    this.schémaBdSuggestions = Object.assign(schémaBdKilimukku);
    this.schémaBdSuggestions.motsClefs = [
      idMotClefProjet,
      ...(this.schémaBdSuggestions.motsClefs || []),
    ];

    this._traductionsOriginalesSelonClefs = {};
    this._remplirClefsOriginales();
  }

  _remplirClefsOriginales() {
    const extraireClefs = (
      d: dicTraductionsLangue,
      préc?: string
    ): { clef: string; valeur: string }[] => {
      let clefs: { clef: string; valeur: string }[] = [];

      for (const [c, v] of Object.entries(d)) {
        const clef = préc ? `${préc}.${c}` : c;
        if (typeof v === "string") {
          clefs.push({ clef, valeur: v });
        } else {
          clefs = [...clefs, ...extraireClefs(v, clef)];
        }
      }
      return clefs;
    };

    for (const [langue, traducs] of Object.entries(
      this.traductionsOriginales
    )) {
      const clefs = extraireClefs(traducs);
      for (const { clef, valeur } of clefs) {
        if (!this._traductionsOriginalesSelonClefs[clef]) {
          this._traductionsOriginalesSelonClefs[clef] = {};
        }
        this._traductionsOriginalesSelonClefs[clef][langue] = valeur;
      }
    }
  }

  établirOriginales(traductions: dicTraductions) {
    this.traductionsOriginales = traductions;

    this._traductionsOriginalesSelonClefs = {};
    this._remplirClefsOriginales();
  }

  async estGestionnaire(): Promise<boolean> {
    return await utils.uneFois(
      async (fSuivi: utils.schémaFonctionSuivi<boolean>) => {
        return await this.suivreEstGestionnaire({ f: fSuivi });
      }
    );
  }

  get clefsOriginales(): string[] {
    return Object.keys(this._traductionsOriginalesSelonClefs);
  }

  async suivreEstGestionnaire({
    f,
  }: {
    f: utils.schémaFonctionSuivi<boolean>;
  }): Promise<utils.schémaFonctionOublier> {
    return await this.constl.suivrePermission({
      idObjet: this.idBdOfficielle,
      f: (accès) => f(Boolean(accès)),
    });
  }

  async suivreEstModérateur({
    f,
  }: {
    f: utils.schémaFonctionSuivi<boolean>;
  }): Promise<utils.schémaFonctionOublier> {
    return await this.constl.suivrePermission({
      idObjet: this.idBdOfficielle,
      f: (accès) => f(accès === "MODÉRATEUR"),
    });
  }

  async ajouterGestionnaire({
    idBdCompte,
    rôle,
  }: {
    idBdCompte: string;
    rôle: typeof accès.rôles[number];
  }): Promise<void> {
    return await this.constl.bds!.inviterAuteur({
      idBd: this.idBdOfficielle,
      idBdCompteAuteur: idBdCompte,
      rôle,
    });
  }

  async suggérer({
    clef,
    traduction,
    langueCible,
    langueSource,
    texteOriginal,
  }: {
    clef: string;
    traduction: string;
    langueCible: string;
    langueSource: string;
    texteOriginal: string;
  }): Promise<string> {
    const élément = {
      [ID_COL_CLEF]: clef,
      [ID_COL_LANGUE_SOURCE]: langueSource,
      [ID_COL_LANGUE_CIBLE]: langueCible,
      [ID_COL_TRADUCTION]: traduction,
      [ID_COL_TEXTE_ORIGINAL]: texteOriginal,
      [ID_COL_DATE]: new Date().getTime(),
    };

    return await this.constl.bds!.ajouterÉlémentÀTableauUnique({
      schémaBd: this.schémaBdSuggestions,
      motClefUnique: this.idMotClefProjet,
      clefTableau: idUniqueTableauSuggestionsKilimukku,
      vals: élément,
    });
  }

  async effacerSuggestion({ empreinte }: { empreinte: string }): Promise<void> {
    return await this.constl.bds!.effacerÉlémentDeTableauUnique({
      schémaBd: this.schémaBdSuggestions,
      motClefUnique: this.idMotClefProjet,
      clefTableau: idUniqueTableauSuggestionsKilimukku,
      empreinte,
    });
  }

  async approuver({
    suggestion,
  }: {
    suggestion: TraductionRéseau;
  }): Promise<void> {
    if (!this.estGestionnaire)
      throw "Non autorisé pour approbation de traductions";

    const {
      clef,
      langueCible,
      langueSource,
      texteOriginal,
      auteur,
      traduction,
      date: dateSuggestion,
    } = suggestion;

    // Effacer les doublons
    const traductions = await utils.uneFois(
      async (
        fSuivi: utils.schémaFonctionSuivi<
          valid.élémentDonnées<élémentBdCentraleTraduction>[]
        >
      ) => {
        return await this.constl.tableaux!.suivreDonnées({
          idTableau: this.idTableauOfficiel,
          f: fSuivi,
        });
      }
    );
    const existantes = traductions.filter(
      (t) =>
        t.données[ID_COL_CLEF] === clef &&
        t.données[ID_COL_LANGUE_CIBLE] === langueCible
    );
    for (const existante of existantes) {
      await this.constl.tableaux!.effacerÉlément({
        idTableau: this.idTableauOfficiel,
        empreinteÉlément: existante.empreinte,
      });
    }

    const élément: élémentBdCentraleTraduction = {
      [ID_COL_CLEF]: clef,
      [ID_COL_TRADUCTION]: traduction,
      [ID_COL_LANGUE_CIBLE]: langueCible,
      [ID_COL_LANGUE_SOURCE]: langueSource,
      [ID_COL_TEXTE_ORIGINAL]: texteOriginal,
      [ID_COL_DATE]: dateSuggestion.getDate(),
      [ID_COL_AUTEUR]: auteur,
    };

    this.constl.tableaux!.ajouterÉlément({
      idTableau: this.idTableauOfficiel,
      vals: élément,
    });
  }

  async suivreClefs({
    f,
  }: {
    f: utils.schémaFonctionSuivi<string[]>;
  }): Promise<utils.schémaFonctionOublier> {
    const fFinale = (
      données: valid.élémentDonnées<élémentBdCentraleTraduction>[]
    ) => {
      // Combiner clefs originales et clefs de la BD Constellation des traductiones officielles
      f([
        ...new Set(
          ...this.clefsOriginales,
          ...données.map((d) => d.données[ID_COL_CLEF])
        ),
      ]);
    };
    return await this.constl.tableaux!.suivreDonnées<élémentBdCentraleTraduction>(
      {
        idTableau: this.idTableauOfficiel,
        f: fFinale,
      }
    );
  }

  obtTraductionsOriginalesClef({
    clef,
  }: {
    clef: string;
  }): { [clef: string]: string } | undefined {
    return this._traductionsOriginalesSelonClefs[clef];
  }

  async suivreTraductionsDeBdOfficielle({
    clef,
    langue,
    f,
  }: {
    clef?: string;
    langue?: string;
    f: utils.schémaFonctionSuivi<TraductionRéseau[]>;
  }): Promise<utils.schémaFonctionOublier> {
    const fFinale = (
      données: valid.élémentDonnées<élémentBdCentraleTraduction>[]
    ) => {
      if (clef)
        données = données.filter((d) => d.données[ID_COL_CLEF] === clef);
      if (langue)
        données = données.filter(
          (d) => d.données[ID_COL_LANGUE_CIBLE] === langue
        );
      f(données.map((d) => élémentBdTradÀRésultatTrad(d)));
    };
    return await this.constl.tableaux!.suivreDonnées({
      idTableau: this.idTableauOfficiel,
      f: fFinale,
    });
  }

  async suivreTraductions({
    f,
    inclureMesSuggestions,
  }: {
    f: utils.schémaFonctionSuivi<dicTraductions>;
    inclureMesSuggestions?: boolean;
  }): Promise<utils.schémaFonctionOublier> {
    const résultats: {
      existantes: dicTraductions;
      officielles: TraductionRéseau[];
      suggestions: TraductionRéseau[];
    } = {
      existantes: this._traductionsOriginalesSelonClefs,
      officielles: [],
      suggestions: [],
    };

    const fFinale = () => {
      const tradsFinales: dicTraductions = JSON.parse(
        JSON.stringify(résultats.existantes)
      );

      const ajouterTrad = (t: TraductionRéseau) => {
        if (!tradsFinales[t.clef]) tradsFinales[t.clef] = {};
        tradsFinales[t.clef][t.langueCible] = t.traduction;
      };

      // On ajoute les traductions officielles
      résultats.officielles.forEach((t) => ajouterTrad(t));

      // On ajoute les sugestions
      résultats.suggestions.forEach((s) => {
        const officielle = résultats.officielles.find(
          (t) => t.clef === s.clef && t.langueCible == s.langueCible
        );

        // Remplacer l'officielle par la suggestions uniquement si la suggestion a été formulée après la traduction officielle
        if (!officielle || officielle.date <= s.date) {
          ajouterTrad(s);
        }
      });
      f(tradsFinales);
    };

    const fSuivreOfficielles = (traducs: TraductionRéseau[]) => {
      résultats.officielles = traducs;
      fFinale();
    };
    const oublierOfficielles = await this.suivreTraductionsDeBdOfficielle({
      f: fSuivreOfficielles,
    });

    const fSuivreMesSuggestions = (suggestions: TraductionRéseau[]) => {
      résultats.suggestions = suggestions;
      fFinale();
    };
    const oublierMesSuggestions = await this.suivreMesSuggestions({
      f: fSuivreMesSuggestions,
    });

    return () => {
      oublierOfficielles();
      oublierMesSuggestions();
    };
  }

  async suivreMesSuggestions({
    f,
  }: {
    f: utils.schémaFonctionSuivi<TraductionRéseau[]>;
  }): Promise<utils.schémaFonctionOublier> {
    return await this.constl.bds!.suivreDonnéesDeTableauUnique<élémentBdSuggestion>(
      {
        schémaBd: this.schémaBdSuggestions,
        motClefUnique: this.idMotClefProjet,
        clefTableau: this.schémaBdSuggestions.tableaux[0].clef!,
        f: (suggestions) =>
          f(
            suggestions.map((s) =>
              élémentBdSuggestionÀRésultatTrad(s, this.constl.idBdCompte!)
            )
          ),
      }
    );
  }

  async rechercherSuggestions({
    clef,
    langue,
    f,
  }: {
    clef?: string;
    langue?: string;
    f: utils.schémaFonctionSuivi<TraductionRéseau[]>;
  }): Promise<utils.schémaRetourFonctionRecherche> {
    const fFinale = (
      suggestions: réseau.élémentDeMembre<élémentBdSuggestion>[]
    ) => {
      if (langue)
        suggestions = suggestions.filter(
          (s) => s.élément.données[ID_COL_LANGUE_CIBLE] === langue
        );
      if (clef)
        suggestions = suggestions.filter(
          (s) => s.élément.données[ID_COL_CLEF] === clef
        );
      f(
        suggestions.map((s) => {
          return {
            date: new Date(s.élément.données[ID_COL_DATE]),
            auteur: s.idBdCompte,
            clef: s.élément.données[ID_COL_CLEF],
            texteOriginal: s.élément.données[ID_COL_TEXTE_ORIGINAL],
            langueSource: s.élément.données[ID_COL_LANGUE_SOURCE],
            langueCible: s.élément.données[ID_COL_LANGUE_CIBLE],
            traduction: s.élément.données[ID_COL_TRADUCTION],
            empreinte: s.élément.empreinte,
          };
        })
      );
    };

    return await this.constl.réseau!.suivreÉlémentsDeTableauxUniques({
      motClefUnique: this.idMotClefProjet,
      clef: this.schémaBdSuggestions.tableaux[0].clef,
      f: fFinale,
    });
  }
}
