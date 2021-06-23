import { KeyValueStore, FeedStore, élémentFeedStore } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
  élémentBdListe,
} from "./client";

type infoMembre = {
  id: string;
};

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
    this._nettoyerListeMembres();
  }

  async _nettoyerListeMembres() {
    const bd = await this.client.ouvrirBd(this.idBd);
    const éléments = ClientConstellation.obtÉlémentsDeBdListe(
      bd as FeedStore,
      false
    );
    const déjàVus: string[] = [];
    for (const é of éléments) {
      const entrée: unknown = (é as élémentBdListe).payload.value;
      const id = (entrée as infoMembre).id;
      if (déjàVus.includes(id)) {
        await (bd as FeedStore).remove((é as élémentBdListe).hash);
      } else {
        déjàVus.push(id);
      }
    }
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
      this.fOublierMembres[id] = () => {
        // Réserver l'espace en attente de générer fOublier
      };
      const f = async (membres: infoMembre[]) => {
        membres.forEach((m: infoMembre) => this.ajouterMembre(m.id));
      };
      const fOublier = await this.client.suivreBdListeDeClef<infoMembre>(
        id,
        "réseau",
        f
      );
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

  async suivreMembres(
    f: schémaFonctionSuivi<string[]>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListe(this.idBd, f);
  }

  async suivreNomsMembre(
    idMembre: string,
    f: schémaFonctionSuivi<{ [key: string]: string }>
  ): Promise<schémaFonctionOublier> {
    const fFinale = (noms?: { [key: string]: string }) => {
      return f(noms || {});
    };
    return await this.client.suivreBdDeClef(
      idMembre,
      "compte",
      fFinale,
      (id: string, f: schémaFonctionSuivi<{ [key: string]: string }>) =>
        this.client.compte!.suivreNoms(f, id)
    );
  }

  async suivreCourrielMembre(
    idMembre: string,
    f: schémaFonctionSuivi<string>
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (bd?: KeyValueStore) => {
      if (bd) return await this.client.compte!.suivreCourriel(f, bd.id);
    };
    return await this.client.suivreBdDeClef(idMembre, "compte", fFinale);
  }

  async suivreImageMembre(
    idMembre: string,
    f: schémaFonctionSuivi<Uint8Array | null>
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (bd?: KeyValueStore) => {
      if (bd) return await this.client.compte!.suivreImage(f, bd.id);
    };
    return await this.client.suivreBdDeClef(idMembre, "compte", fFinale);
  }

  async suivreBdsMembre(
    id: string,
    f: schémaFonctionSuivi<string[] | undefined>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDeClef(
      id,
      "bds",
      f,
      (id: string, f: schémaFonctionSuivi<string[]>) =>
        this.client.bds!.suivreBds(f, id)
    );
  }

  async suivreFavorisMembre(
    id: string,
    f: schémaFonctionSuivi<string[] | undefined>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDeClef(
      id,
      "bds",
      f,
      (id: string, f: schémaFonctionSuivi<string[]>) =>
        this.client.favoris!.suivreFavoris(f, id)
    );
  }

  async suivreBds(
    f: schémaFonctionSuivi<string[]>
  ): Promise<schémaFonctionOublier> {
    const fBranche = async (
      id: string,
      f: schémaFonctionSuivi<string[]>
    ): Promise<schémaFonctionOublier> => {
      const bds: { propres: string[]; favoris: string[] } = {
        propres: [],
        favoris: [],
      };
      const fFinale = async function () {
        const toutes = [...new Set([...bds.propres, ...bds.favoris])];
        f(toutes);
      };
      const oublierBdsPropres = await this.suivreBdsMembre(id, (propres) => {
        bds.propres = propres || [];
        fFinale();
      });
      const oublierBdsFavoris = await this.suivreFavorisMembre(
        id,
        (favoris) => {
          bds.favoris = favoris || [];
          fFinale();
        }
      );
      return () => {
        oublierBdsPropres();
        oublierBdsFavoris();
      };
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
