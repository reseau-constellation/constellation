import { v4 as uuidv4 } from "uuid";
import { FeedStore, KeyValueStore, élémentFeedStore } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
  élémentsBd,
  élémentBdListe,
} from "./client";
import ContrôleurConstellation from "./accès/contrôleurConstellation";
import {
  erreurValidation,
  règleVariable,
  générerFonctionRègle,
  schémaFonctionValidation,
} from "./valid";

type InfoCol = {
  id: string;
  variable: string;
};

export function élémentsÉgaux(
  élément1: { [key: string]: élémentsBd },
  élément2: { [key: string]: élémentsBd }
): boolean {
  const clefs1 = Object.keys(élément1);
  const clefs2 = Object.keys(élément2);
  if (!clefs1.every((x) => élément1[x] === élément2[x])) return false;
  if (!clefs2.every((x) => élément1[x] === élément2[x])) return false;
  return true;
}

export default class Tableaux {
  client: ClientConstellation;

  constructor(client: ClientConstellation) {
    this.client = client;
  }

  async créerTableau(): Promise<string> {
    const idBdTableau = await this.client.créerBdIndépendante("kvstore", {
      adresseBd: undefined,
    });
    const bdTableaux = (await this.client.ouvrirBd(
      idBdTableau
    )) as KeyValueStore;

    const accès = (bdTableaux.access as unknown) as ContrôleurConstellation;
    const optionsAccès = { adresseBd: accès.adresseBd };

    const idBdNoms = await this.client.créerBdIndépendante(
      "kvstore",
      optionsAccès
    );
    await bdTableaux.set("noms", idBdNoms);

    const idBdDonnées = await this.client.créerBdIndépendante(
      "feed",
      optionsAccès
    );
    await bdTableaux.set("données", idBdDonnées);

    const idBdColonnes = await this.client.créerBdIndépendante(
      "feed",
      optionsAccès
    );
    await bdTableaux.set("colonnes", idBdColonnes);

    return idBdTableau;
  }

  async copierTableau(id: string): Promise<string> {
    const bdBase = (await this.client.ouvrirBd(id)) as KeyValueStore;
    const idNouveauTableau = await this.créerTableau();
    const nouvelleBd = (await this.client.ouvrirBd(
      idNouveauTableau
    )) as KeyValueStore;

    const idBdNoms = await bdBase.get("noms");
    const noms = ((await this.client.ouvrirBd(idBdNoms)) as KeyValueStore).all;
    await this.ajouterNomsTableau(idNouveauTableau, noms);

    //Copier les données
    const idBdDonnées = await bdBase.get("données");
    const bdDonnées = (await this.client.ouvrirBd(idBdDonnées)) as FeedStore;

    const idNouvelleBdDonnées = await nouvelleBd.get("données");
    const nouvelleBdDonnées = (await this.client.ouvrirBd(
      idNouvelleBdDonnées
    )) as FeedStore;

    const données = ClientConstellation.obtÉlémentsDeBdListe(bdDonnées);
    données.forEach(async (d) => {
      await nouvelleBdDonnées.add(d);
    });

    //Copier les colonnes
    const idBdColonnes = await bdBase.get("colonnes");
    const bdColonnes = (await this.client.ouvrirBd(idBdColonnes)) as FeedStore;

    const idNouvelleBdColonnes = await nouvelleBd.get("colonnes");
    const nouvelleBdColonnes = (await this.client.ouvrirBd(
      idNouvelleBdColonnes
    )) as FeedStore;

    const colonnes = ClientConstellation.obtÉlémentsDeBdListe(bdColonnes);
    colonnes.forEach(async (c) => {
      await nouvelleBdColonnes.add(c);
    });

    return idNouveauTableau;
  }

  async suivreDonnées(
    idTableau: string,
    f: schémaFonctionSuivi<élémentBdListe[]>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListeDeClef(
      idTableau,
      "données",
      f,
      false
    );
  }

  async ajouterÉlément(
    idTableau: string,
    vals: { [key: string]: élémentsBd }
  ): Promise<string> {
    const optionsAccès = await this.client.obtOpsAccès(idTableau);
    const idBdDonnées = await this.client.obtIdBd(
      "données",
      idTableau,
      "feed",
      optionsAccès
    );
    if (!idBdDonnées)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdDonnées = (await this.client.ouvrirBd(idBdDonnées)) as FeedStore;
    vals = await this.vérifierClefsÉlément(idTableau, vals);
    const id = uuidv4();
    return await bdDonnées.add({ ...vals, id });
  }

  async modifierÉlément(
    idTableau: string,
    vals: { [key: string]: élémentsBd },
    empreintePrécédente: string
  ): Promise<string | void> {
    const optionsAccès = await this.client.obtOpsAccès(idTableau);
    const idBdDonnées = await this.client.obtIdBd(
      "données",
      idTableau,
      "feed",
      optionsAccès
    );
    if (!idBdDonnées)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdDonnées = (await this.client.ouvrirBd(idBdDonnées)) as FeedStore;

    const précédent = this.client.obtÉlémentBdListeSelonEmpreinte(
      bdDonnées,
      empreintePrécédente
    );

    let élément = Object.assign({}, précédent, vals);

    Object.keys(vals).map((c: string) => {
      if (vals[c] === undefined) delete élément[c];
    });
    élément = await this.vérifierClefsÉlément(idTableau, élément);

    if (!élémentsÉgaux(élément, précédent)) {
      const résultat = await Promise.all([
        bdDonnées.remove(empreintePrécédente),
        bdDonnées.add(élément),
      ]);
      return résultat[1];
    }
    return Promise.resolve();
  }

  async vérifierClefsÉlément<T>(
    idTableau: string,
    élément: { [key: string]: T }
  ): Promise<{ [key: string]: T }> {
    const optionsAccès = await this.client.obtOpsAccès(idTableau);
    const idBdColonnes = await this.client.obtIdBd(
      "colonnes",
      idTableau,
      "feed",
      optionsAccès
    );
    if (!idBdColonnes)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdColonnes = (await this.client.ouvrirBd(idBdColonnes)) as FeedStore;
    const idsColonnes: string[] = bdColonnes
      .iterator({ limit: -1 })
      .collect()
      .map((e: élémentFeedStore) => e.payload.value.id);
    const clefsPermises = [...idsColonnes, "id"];
    const clefsFinales = Object.keys(élément).filter((x: string) =>
      clefsPermises.includes(x)
    );
    return Object.fromEntries(clefsFinales.map((x: string) => [x, élément[x]]));
  }

  async effacerÉlément(
    idTableau: string,
    empreinteÉlément: string
  ): Promise<void> {
    const optionsAccès = await this.client.obtOpsAccès(idTableau);
    const idBdDonnées = await this.client.obtIdBd(
      "données",
      idTableau,
      "feed",
      optionsAccès
    );
    if (!idBdDonnées)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdDonnées = (await this.client.ouvrirBd(idBdDonnées)) as FeedStore;
    await bdDonnées.remove(empreinteÉlément);
  }

  async ajouterNomsTableau(
    idTableau: string,
    noms: { [key: string]: string }
  ): Promise<void> {
    const optionsAccès = await this.client.obtOpsAccès(idTableau);
    const idBdNoms = await this.client.obtIdBd(
      "noms",
      idTableau,
      "kvstore",
      optionsAccès
    );
    if (!idBdNoms)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    for (const lng in noms) {
      await bdNoms.set(lng, noms[lng]);
    }
  }

  async sauvegarderNomTableau(
    idTableau: string,
    langue: string,
    nom: string
  ): Promise<void> {
    const optionsAccès = await this.client.obtOpsAccès(idTableau);
    const idBdNoms = await this.client.obtIdBd(
      "noms",
      idTableau,
      "kvstore",
      optionsAccès
    );
    if (!idBdNoms)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    await bdNoms.set(langue, nom);
  }

  async effacerNomTableau(idTableau: string, langue: string): Promise<void> {
    const optionsAccès = await this.client.obtOpsAccès(idTableau);
    const idBdNoms = await this.client.obtIdBd(
      "noms",
      idTableau,
      "kvstore",
      optionsAccès
    );
    if (!idBdNoms)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    await bdNoms.del(langue);
  }

  async suivreNomsTableau(
    idTableau: string,
    f: schémaFonctionSuivi<{ [key: string]: string }>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef(idTableau, "noms", f);
  }

  async ajouterColonneTableau(
    idTableau: string,
    idVariable: string
  ): Promise<void> {
    const optionsAccès = await this.client.obtOpsAccès(idTableau);
    const idBdColonnes = await this.client.obtIdBd(
      "colonnes",
      idTableau,
      "feed",
      optionsAccès
    );
    if (!idBdColonnes)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdColonnes = (await this.client.ouvrirBd(idBdColonnes)) as FeedStore;
    const entrée: InfoCol = {
      id: uuidv4(),
      variable: idVariable,
    };
    await bdColonnes.add(entrée);
  }

  async suivreColonnes(
    idTableau: string,
    f: schémaFonctionSuivi<InfoCol[]>
  ): Promise<schémaFonctionOublier> {
    const fFinale = (colonnes?: InfoCol[]) => {
      return f(colonnes || []);
    };
    const fBranche = async (
      id: string,
      fSuivi: schémaFonctionSuivi<InfoCol>,
      branche: unknown
    ): Promise<schémaFonctionOublier> => {
      return await this.client.variables!.suivreCatégorieVariable(
        id,
        async (catégorie: string) => {
          const col = Object.assign({ catégorie }, branche as InfoCol);
          fSuivi(col);
        }
      );
    };
    const fIdBdDeBranche = (x: unknown) => (x as InfoCol).variable;

    const fCode = (x: InfoCol) => x.id;
    const fSuivreBdColonnes = async (
      id: string,
      f: schémaFonctionSuivi<InfoCol[]>
    ): Promise<schémaFonctionOublier> => {
      return await this.client.suivreBdsDeBdListe(
        id,
        f,
        fBranche,
        fIdBdDeBranche,
        undefined,
        fCode
      );
    };

    return await this.client.suivreBdDeClef(
      idTableau,
      "colonnes",
      fFinale,
      fSuivreBdColonnes
    );
  }

  async suivreVariables(
    idTableau: string,
    f: schémaFonctionSuivi<string[]>
  ): Promise<schémaFonctionOublier> {
    const fFinale = (variables?: string[]) => {
      f(variables || []);
    };
    const fSuivreBdColonnes = async (
      id: string,
      f: schémaFonctionSuivi<string[]>
    ): Promise<schémaFonctionOublier> => {
      return await this.client.suivreBdListe(id, (cols: InfoCol[]) =>
        f(cols.map((c) => c.variable))
      );
    };
    return await this.client.suivreBdDeClef(
      idTableau,
      "colonnes",
      fFinale,
      fSuivreBdColonnes
    );
  }

  async suivreRègles(
    idTableau: string,
    f: schémaFonctionSuivi<règleVariable[]>
  ): Promise<schémaFonctionOublier> {}

  async suivreValidDonnées(
    idTableau: string,
    f: schémaFonctionSuivi<erreurValidation[]>
  ): Promise<schémaFonctionOublier> {
    const info: { données: unknown[]; règles: schémaFonctionValidation[] } = {
      données: [],
      règles: [],
    };
    const fFinale = () => {
      let erreurs: erreurValidation[] = [];
      for (const r of info.règles) {
        const nouvellesErreurs = info.données.map((d) => r(d));
        erreurs = [...erreurs, ...nouvellesErreurs.flat()];
      }
      f(erreurs);
    };
    const fFinaleRègles = (règles: règleVariable[]) => {
      info.règles = règles.map((r) => générerFonctionRègle(r));
      fFinale();
    };
    const fFinaleDonnées = (données: unknown[]) => {
      info.données = données;
      fFinale();
    };
    const fOublierRègles = await this.suivreRègles(idTableau, fFinaleRègles);
    const fOublierDonnées = await this.suivreDonnées(idTableau, fFinaleDonnées);
    const fOublier = () => {
      fOublierRègles();
      fOublierDonnées();
    };
    return fOublier;
  }

  async effacerTableau(idTableau: string): Promise<void> {
    // Effacer toutes les composantes du tableau
    const optionsAccès = await this.client.obtOpsAccès(idTableau);
    for (const clef in ["noms"]) {
      const idBd = await this.client.obtIdBd(
        clef,
        idTableau,
        undefined,
        optionsAccès
      );
      if (idBd) await this.client.effacerBd(idBd);
    }
    // Effacer le tableau lui-même
    await this.client.effacerBd(idTableau);
  }
}
