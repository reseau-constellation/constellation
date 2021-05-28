import { KeyValueStore, FeedStore, élémentFeedStore } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
  élémentBdListe,
} from "./client";

interface infoMembre {
  id: string;
}

export default class Réseau {
  client: ClientConstellation;
  idBd: string;
  fOublierMembres: { [key: string]: schémaFonctionOublier };

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;
    this.fOublierMembres = {};

    // N'oublions pas de nous ajouter nous-mêmes la première fois
    this.ajouterMembre(this.client.bdRacine!.id);
  }

  async ajouterMembre(id: string): Promise<void> {
    const existante = await this.client.rechercherBdListe(
      this.idBd,
      (e: élémentFeedStore) => e.payload.value.id === id
    );
    if (!existante) {
      const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
      const élément: infoMembre = {
        id: id,
      };
      await bdRacine.add(élément);
    }
    if (!this.fOublierMembres[id]) {
      const f = async (membres: infoMembre[]) => {
        membres.forEach((m: infoMembre) => this.ajouterMembre(m.id));
      };
      const fOublier = await this.client.suivreBdListeDeClef(id, "réseau", f);
      this.fOublierMembres[id] = fOublier;
    }
  }

  async enleverMembre(id: string): Promise<void> {
    this.fOublierMembres[id]();
    const bdMembres = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const entrée = bdMembres
      .iterator({ limit: -1 })
      .collect()
      .find((e: élémentBdListe) => e.payload.value === id);
    await bdMembres.remove(entrée.hash);
  }

  async suivreMembres(f: schémaFonctionSuivi): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListe(this.idBd, f);
  }

  async suivreNomsMembre(
    idMembre: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDeClef(
      idMembre,
      "compte",
      f,
      (id: string, f: schémaFonctionSuivi) =>
        this.client.compte!.suivreNoms(f, id)
    );
  }

  async suivreCourrielMembre(
    idMembre: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (bd: KeyValueStore) => {
      return await this.client.compte!.suivreCourriel(f, bd.id);
    };
    return await this.client.suivreBdDeClef(idMembre, "compte", fFinale);
  }

  async suivreImageMembre(
    idMembre: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (bd: KeyValueStore) => {
      return await this.client.compte!.suivreImage(f, bd.id);
    };
    return await this.client.suivreBdDeClef(idMembre, "compte", fFinale);
  }

  async suivreBdsMembre(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDeClef(
      id,
      "bds",
      f,
      (id: string, f: schémaFonctionSuivi) => this.client.bds!.suivreBds(f, id)
    );
  }

  async suivreBds(f: schémaFonctionSuivi): Promise<schémaFonctionOublier> {
    const fBranche = async (
      id: string,
      f: schémaFonctionSuivi
    ): Promise<schémaFonctionOublier> => {
      return await this.suivreBdsMembre(id, f);
    };
    const fIdBdDeBranche = (x: unknown) => (x as infoMembre).id;
    const fCode = (x: unknown) => (x as infoMembre).id;

    return await this.client.suivreBdsDeBdListe(
      this.idBd,
      f,
      fBranche,
      fIdBdDeBranche,
      undefined,
      fCode
    );
  }
}
