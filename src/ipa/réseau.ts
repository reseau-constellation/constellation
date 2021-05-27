import { KeyValueStore, FeedStore } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
  élémentBdListe
} from "./client";

interface infoMembre {
  id: string
}

export default class Réseau {
  client: ClientConstellation;
  idBd: string;
  fOublierMembres: {[key: string]: schémaFonctionOublier};

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;
    this.fOublierMembres = {};
  }

  async ajouterMembre(id: string): Promise<void> {
    const existante = await this.client.rechercherBdListe(
      this.idBd,
      (e: any) => e.payload.value.id === id
    );
    if (!existante) {
      const bdRacine = await this.client.ouvrirBd(this.idBd);
      const élément: infoMembre = {
        id: id,
      };
      await bdRacine.add(élément);
    }
    if (!this.fOublierMembres[id]) {
      const f = async (membres: infoMembre[]) => {
        membres.forEach((m: infoMembre) => this.ajouterMembre(m.id))
      }
      const fOublier = await this.client.suivreBdListeDeClef(id, "réseau", f);
      this.fOublierMembres[id] = fOublier
    }
  }

  async enleverMembre(id: string): Promise<void> {
    this.fOublierMembres[id]()
    const bdMembres = await this.client.ouvrirBd(this.idBd)
    const entrée = (await bdMembres.iterator({ limit: -1 }).collect()).find(
      (e: élémentBdListe) => e.payload.value === id
    );
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
      idMembre, "compte", f, (id: string, f: schémaFonctionSuivi) => this.client.compte!.suivreNoms(f, id)
    )
  }

  async suivreCourrielMembre(
    idMembre: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (bd: KeyValueStore) => {
      return await this.client.compte!.suivreCourriel(f, bd.id)
    };
    return await this.client.suivreBdDeClef(idMembre, "compte", fFinale);
  }

  async suivreImageMembre(
    idMembre: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (bd: KeyValueStore) => {
      return await this.client.compte!.suivreImage(f, bd.id)
    };
    return await this.client.suivreBdDeClef(idMembre, "compte", fFinale);
  }

  async suivreBdsMembre(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDeClef(
      id, "bds", f, (id: string, f: schémaFonctionSuivi) => this.client.bds!.suivreBds(f, id)
    )
  }

  async suivreBds(f: schémaFonctionSuivi): Promise<schémaFonctionOublier> {
    const fBranche = async (id: string, f: schémaFonctionSuivi): Promise<schémaFonctionOublier> => {
      return await this.suivreBdsMembre(
        id,
        (membres: infoMembre[]) => f([...membres.map((m: infoMembre) => m.id), this.client.bdRacine!.id])
      )
    }
    return await this.client.suivreBdsDeBdListe(
      this.idBd, f, fBranche
    )
  }

  /*
  async rechercherBds(
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {

  }
  */
}
