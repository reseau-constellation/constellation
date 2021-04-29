import { v4 as uuidv4 } from "uuid";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier
} from "./client";

export default class Réseau {
  client: ClientConstellation;
  idBD: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBD = id;
  }

  async ajouterMembre(id: string): Promise<void> {
    const existante = await this.client.rechercherBdListe(
      this.idBD,
      (e: any) => e.payload.value.id === id
    );
    if (!existante) {
      const bdRacine = await this.client.ouvrirBD(this.idBD);
      const élément = {
        id: id
      };
      await bdRacine.add(élément);
    }
  }

  async suivreMembres(f: schémaFonctionSuivi): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListe(this.idBD, f);
  }

  async suivreNomsMembre(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const idBdCompte = await this.client.obtIdBd("compte", id);
    return await this.client.compte!.suivreNoms(f, idBdCompte);
  }

  async suivreCourrielMembre(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const idBdCompte = await this.client.obtIdBd("compte", id);
    return await this.client.compte!.suivreCourriel(f, idBdCompte);
  }

  async suivreImageMembre(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const idBdCompte = await this.client.obtIdBd("compte", id);
    return await this.client.compte!.suivreImage(f, idBdCompte);
  }

  async suivreBdsMembre(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const idBdBds = await this.client.obtIdBd("bds", id);
    return await this.client.bds!.suivreBDs(f, idBdBds);
  }

  async suivreBds(f: schémaFonctionSuivi): Promise<schémaFonctionOublier> {
    interface infoMembre {
      id: string
    }
    const fRacine = async (fSuivi: schémaFonctionSuivi) => {
      return await this.suivreMembres(
        (membres) => {
          return fSuivi([...membres.map((m: infoMembre)=>m.id), this.client._bdRacine.id])
        }
      )
    };
    const fBranche = this.suivreBdsMembre.bind(this);
    return await this.client.suivreBdsEmboîtées(
      fRacine,
      fBranche,
      f
    );
  }

  /*
  async rechercherBds(
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {

  }
  */
}
