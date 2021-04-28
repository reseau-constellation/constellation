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
    interface InterfaceBdsMembre {
      bds: string[],
      fOublier?: schémaFonctionOublier
    }
    interface InterfaceMembre {
      id: string
    }
    const bds: { [key: string]: InterfaceBdsMembre } = {};
    const fFinale = () => {
      const listeBds = Object.values(bds)
        .map(x => x.bds)
        .flat();
      f(listeBds);
    };

    const fMembres = async (membres: InterfaceMembre[]) => {
      const existants = Object.keys(bds);
      const idMembres = [...membres.map(m => m.id), this.client._bdRacine.id]
      const nouveaux = idMembres.filter(m => !existants.includes(m));
      const disparus = existants.filter(m => !idMembres.includes(m));
      for (const d of disparus) {
        const fOublier = bds[d].fOublier;
        if (fOublier) fOublier();
        delete bds[d];
      }
      nouveaux.map(async (n) => {
        bds[n] = {
          bds: [],
        };
        const fSuivreMembre = (bdsMembre: string[]) => {
          bds[n].bds = bdsMembre;
          fFinale();
        };
        const fOublier = await this.suivreBdsMembre(n, fSuivreMembre);
        bds[n].fOublier = fOublier;
      })
    };
    const oublierMembres = await this.suivreMembres(fMembres);

    const oublier = () => {
      oublierMembres();
      Object.values(bds).map(x => x.fOublier ? x.fOublier() : null);
    };
    return oublier;
  }

  /*
  async rechercherBds(
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {

  }
  */
}
