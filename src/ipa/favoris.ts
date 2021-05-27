import { FeedStore } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
} from "./client";

interface EntréeFavoris {
  id: string;
}

export default class Favoris {
  client: ClientConstellation;
  idBd: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;
  }

  async suivreFavoris(
    f: schémaFonctionSuivi,
    idBdRacine?: string
  ): Promise<schémaFonctionOublier> {
    idBdRacine = idBdRacine || this.idBd;
    const fFinale = (listeFavoris: EntréeFavoris[]) => {
      f(listeFavoris.map((x: EntréeFavoris) => x.id));
    };
    return await this.client.suivreBdListe(idBdRacine, fFinale);
  }

  async épinglerFavori(id: string): Promise<void> {
    const existante = await this.client.rechercherBdListe(
      this.idBd,
      (e: any) => e.payload.value.id === id
    );
    if (!existante) {
      const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
      const élément = {
        id: id,
      };
      await bdRacine.add(élément);
    }
  }

  async désépinglerFavori(id: string): Promise<void> {
    const existante = await this.client.rechercherBdListe(
      this.idBd,
      (e: any) => e.payload.value.id === id
    );
    if (existante) {
      const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
      await bdRacine.remove(existante.hash);
    }
  }

  async suivreÉtatFavori(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const fFinale = (favoris: EntréeFavoris[]) => {
      f(favoris.map((x: EntréeFavoris) => x.id).includes(id));
    };
    return await this.client.suivreBdListe(this.idBd, fFinale);
  }
}
