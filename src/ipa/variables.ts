import { FeedStore, KeyValueStore } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
} from "./client";

export default class Variables {
  client: ClientConstellation;
  idBd: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;
  }

  async suivreVariables(
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListe(this.idBd, f);
  }

  async créerVariable(catégorie: string): Promise<string> {
    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const idBdVariable = await this.client.créerBdIndépendante("kvstore");
    await bdRacine.add(idBdVariable);

    const bdVariable = (await this.client.ouvrirBd(
      idBdVariable
    )) as KeyValueStore;
    const idBdNoms = await this.client.créerBdIndépendante("kvstore");
    await bdVariable.set("noms", idBdNoms);

    await bdVariable.set("catégorie", catégorie);

    return idBdVariable;
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

  async suivreNomsVariable(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef(id, "noms", f);
  }

  async suivreDescrVariable(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef(id, "descriptions", f);
  }

  async suivreCatégorieVariable(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBd(id, async (bd) => {
      const catégorie = await (bd as KeyValueStore).get("catégorie");
      f(catégorie);
    });
  }

  async suivreUnitésVariable(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBd(id, async (bd) => {
      const catégorie = await (bd as KeyValueStore).get("unité");
      f(catégorie);
    });
  }

  async effacerVariable(id: string): Promise<void> {
    // Effacer l'entrée dans notre liste de variables
    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const entrée = bdRacine
      .iterator({ limit: -1 })
      .collect()
      .find((e: { [key: string]: any }) => e.payload.value === id);
    await bdRacine.remove(entrée.hash);
  }
}
