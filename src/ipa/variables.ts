import { FeedStore, KeyValueStore } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
  élémentsBd
} from "./client";
import ContrôleurConstellation, {
  nomType as typeContrôleurAccèsConst,
} from "./accès/contrôleurConstellation";
import {
  règleVariable,
  règleCatégorie
} from "./valid";

import { STATUT } from "./bds";

export type catégorieVariables =
  | "numérique"
  | "date"
  | "heure"
  | "dateEtHeure"
  | "chaîne"
  | "catégorique"
  | "booléen"
  | "géojson"
  | "vidéo"
  | "audio"
  | "photo"
  | "fichier";

export default class Variables {
  client: ClientConstellation;
  idBd: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;
  }

  async suivreVariables(
    f: schémaFonctionSuivi<string[]>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListe<string>(this.idBd, f);
  }

  async créerVariable(catégorie: catégorieVariables): Promise<string> {
    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const idBdVariable = await this.client.créerBdIndépendante("kvstore", {
      adresseBd: undefined,
    });
    await bdRacine.add(idBdVariable);

    const bdVariable = (await this.client.ouvrirBd(
      idBdVariable
    )) as KeyValueStore;

    const accès = (bdVariable.access as unknown) as ContrôleurConstellation;
    const optionsAccès = { adresseBd: accès.adresseBd };

    const idBdNoms = await this.client.créerBdIndépendante(
      "kvstore",
      optionsAccès
    );
    await bdVariable.set("noms", idBdNoms);

    const idBdDescr = await this.client.créerBdIndépendante(
      "kvstore",
      optionsAccès
    );
    await bdVariable.set("descriptions", idBdDescr);

    const idBdRègles = await this.client.créerBdIndépendante(
      "feed",
      optionsAccès
    );
    await bdVariable.set("règles", idBdRègles);

    await bdVariable.set("catégorie", catégorie);

    await bdVariable.set("unités", undefined);

    await this.établirStatut(idBdVariable, { statut: STATUT.ACTIVE });

    return idBdVariable;
  }

  async copierVariable(id: string): Promise<string> {
    const bdBase = (await this.client.ouvrirBd(id)) as KeyValueStore;
    const catégorie = await bdBase.get("catégorie");

    const idNouvelleBd = await this.créerVariable(catégorie);

    const idBdNoms = await bdBase.get("noms");
    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    const noms = ClientConstellation.obtObjetdeBdDic(bdNoms) as {
      [key: string]: string;
    };
    await this.ajouterNomsVariable(idNouvelleBd, noms);

    const idBdDescr = await bdBase.get("descriptions");
    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    const descriptions = ClientConstellation.obtObjetdeBdDic(bdDescr) as {
      [key: string]: string;
    };
    await this.ajouterDescriptionsVariable(idNouvelleBd, descriptions);

    const idBdRègles = await bdBase.get("règles");
    const bdRègles = (await this.client.ouvrirBd(idBdRègles)) as FeedStore;
    const règles = ClientConstellation.obtÉlémentsDeBdListe(
      bdRègles
    ) as règleVariable[];
    règles.forEach((r: règleVariable) => {
      this.ajouterRègleVariable(idNouvelleBd, r);
    });

    const statut = (await bdBase.get("statut")) || STATUT.ACTIVE;
    await this.établirStatut(idNouvelleBd, { statut });

    return idNouvelleBd;
  }

  async migrerVariables(): Promise<void> {
    // Fonction pour migrer les variables qui n'ont pas le bon contrôleur d'accès
    const migrerVariableSiNécessaire = async (id: string): Promise<string> => {
      const bd = await this.client.ouvrirBd(id);
      const accès = bd.access.type;
      if (accès !== typeContrôleurAccèsConst) {
        const idNouvelleBd = await this.copierVariable(id);
        await this.marquerObsolète(id, idNouvelleBd);
        return idNouvelleBd;
      }
      return id;
    };

    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const variablesExistantes = ClientConstellation.obtÉlémentsDeBdListe(
      bdRacine
    ) as string[];

    // Migrer les BDs si nécessaire
    variablesExistantes.forEach(async (idBd: string) => {
      const idNouvelle = await migrerVariableSiNécessaire(idBd);
      if (idBd !== idNouvelle) {
        await bdRacine.add(idNouvelle);
      }
    });
  }

  async ajouterNomsVariable(
    id: string,
    noms: { [key: string]: string }
  ): Promise<void> {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    for (const lng in noms) {
      await bdNoms.set(lng, noms[lng]);
    }
  }

  async sauvegarderNomVariable(
    id: string,
    langue: string,
    nom: string
  ): Promise<void> {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    await bdNoms.set(langue, nom);
  }

  async effacerNomVariable(id: string, langue: string): Promise<void> {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    await bdNoms.del(langue);
  }

  async ajouterDescriptionsVariable(
    id: string,
    descriptions: { [key: string]: string }
  ): Promise<void> {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    if (!idBdDescr) throw `Permission de modification refusée pour BD ${id}.`;

    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    for (const lng in descriptions) {
      await bdDescr.set(lng, descriptions[lng]);
    }
  }

  async sauvegarderDescrVariable(
    id: string,
    langue: string,
    nom: string
  ): Promise<void> {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    if (!idBdDescr) throw `Permission de modification refusée pour BD ${id}.`;

    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    await bdDescr.set(langue, nom);
  }

  async effacerbdDescrVariable(id: string, langue: string): Promise<void> {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    if (!idBdDescr) throw `Permission de modification refusée pour BD ${id}.`;

    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    await bdDescr.del(langue);
  }

  async sauvegarderCatégorieVariable(
    id: string,
    catégorie: string
  ): Promise<void> {
    const bdVariable = (await this.client.ouvrirBd(id)) as KeyValueStore;
    await bdVariable.set("catégorie", catégorie);
  }

  async ajouterRègleVariable(
    id: string,
    règle: règleVariable
  ): Promise<void> {
    const idBdRègles = await this.client.obtIdBd("règles", id, "feed");
    if (!idBdRègles) throw `Permission de modification refusée pour BD ${id}.`;

    const bdRègles = (await this.client.ouvrirBd(idBdRègles)) as FeedStore;
    bdRègles.add(règle)
  }

  async suivreNomsVariable(
    id: string,
    f: schémaFonctionSuivi<{ [key: string]: string }>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef(id, "noms", f);
  }

  async suivreDescrVariable(
    id: string,
    f: schémaFonctionSuivi<{ [key: string]: string }>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef(id, "descriptions", f);
  }

  async suivreCatégorieVariable(
    id: string,
    f: schémaFonctionSuivi<catégorieVariables>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBd(id, async (bd) => {
      const catégorie = await (bd as KeyValueStore).get("catégorie");
      f(catégorie);
    });
  }

  async suivreUnitésVariable(
    id: string,
    f: schémaFonctionSuivi<string>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBd(id, async (bd) => {
      const catégorie = await (bd as KeyValueStore).get("unités");
      f(catégorie);
    });
  }

  async suivreRèglesVariable(
    id: string,
    f: schémaFonctionSuivi<règleVariable[]>
  ): Promise<schémaFonctionOublier> {
    const règles: {catégorie: règleVariable[], propres: règleVariable[]} = {
      catégorie: [],
      propres: []
    }
    const fFinale = () => {
      f([...règles.catégorie, ...règles.propres])
    };

    const fSuivreCatégorie = (catégorie: catégorieVariables) => {
      const règleCat: règleCatégorie = {
        typeRègle: "catégorie",
        détails: { catégorie },
        source: "variable"
      }
      règles.catégorie = [règleCat]
      fFinale()
    }
    const fOublierCatégorie = await this.suivreCatégorieVariable(
      id,
      fSuivreCatégorie
    );

    const fSuivreRèglesPropres = (rgls: règleVariable[]) => {
      règles.propres = rgls
      fFinale()
    }
    const fOublierRèglesPropres = await this.client.suivreBdListeDeClef(
      id,
      "règles",
      fSuivreRèglesPropres as (rgls: élémentsBd[]) => void
    )

    const fOublier = () => {
      fOublierCatégorie()
      fOublierRèglesPropres()
    }
    return fOublier
  }

  async établirStatut(
    id: string,
    statut: { statut: string; idNouvelle?: string }
  ): Promise<void> {
    const bd = (await this.client.ouvrirBd(id)) as KeyValueStore;
    await bd.set("statut", statut);
  }

  async marquerObsolète(id: string, idNouvelle?: string): Promise<void> {
    const bd = (await this.client.ouvrirBd(id)) as KeyValueStore;
    bd.set("statut", { statut: STATUT.OBSOLÈTE, idNouvelle });
  }

  async effacerVariable(id: string): Promise<void> {
    // Effacer l'entrée dans notre liste de variables
    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const entrée = bdRacine
      .iterator({ limit: -1 })
      .collect()
      .find((e: { [key: string]: any }) => e.payload.value === id);
    await bdRacine.remove(entrée.hash);
    await this.client.effacerBd(id);
  }
}
