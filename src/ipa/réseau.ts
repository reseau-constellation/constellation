import {
  KeyValueStore,
  FeedStore,
  élémentFeedStore,
  isValidAddress,
} from "orbit-db";
import Semaphore from "@chriscdn/promise-semaphore";
import ContrôleurConstellation from "./accès/contrôleurConstellation";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
  élémentBdListe,
} from "./client";

export type infoMembre = {
  idSFIP: string;
  idOrbite: string;
  idBdRacine: string;
  clefPublique: string;
  signatures: { id: string; publicKey: string };
};

export type infoMembreEnLigne = infoMembre & {
  vuIlyA?: number;
};

type infoRéplication = {
  idBdRacineMembre: string;
  idOrbite: string;
};

const verrouAjouterMembre = new Semaphore();

export default class Réseau {
  client: ClientConstellation;
  idBd: string;
  dispositifsEnLigne: { [key: string]: {
      info: infoMembre;
      vuÀ: number;
    }
  };
  fOublierMembres: { [key: string]: schémaFonctionOublier };

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;
    this.dispositifsEnLigne = {};
    this.fOublierMembres = {};

    // N'oublions pas de nous ajouter nous-mêmes la première fois
    this.ajouterMembre({
      idSFIP: this.client.idNodeSFIP!.id,
      idOrbite: this.client.orbite!.identity.id,
      clefPublique: this.client.orbite!.identity.publicKey,
      signatures: this.client.orbite!.identity.signatures,
      idBdRacine: this.client.bdRacine!.id,
    });
    this._nettoyerListeMembres();
  }

  async _nettoyerListeMembres() {
    const bd = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const éléments = ClientConstellation.obtÉlémentsDeBdListe<infoMembre>(
      bd,
      false
    );
    const déjàVus: string[] = [];
    for (const é of éléments) {
      const entrée = é.payload.value;

      // Enlever les entrées non valides (d'une ancienne version de Constellation)
      const valide = await this._validerInfoMembre(entrée);
      if (!valide) await bd.remove(é.hash);

      // Enlever les doublons (ne devraient plus se présenter avec la nouvelle version)
      const id = entrée.idOrbite;
      if (id && déjàVus.includes(id)) {
        await bd.remove(é.hash);
      } else {
        déjàVus.push(id);
      }
    }
  }

  async _validerInfoMembre(info: infoMembre): Promise<boolean> {
    const { idBdRacine, signatures, clefPublique, idOrbite } = info;
    if (!(idBdRacine && signatures && clefPublique && idOrbite)) return false;

    const sigIdValide = await this.client.vérifierSignature(
      {
        signature: signatures.id,
        clefPublique: clefPublique,
      },
      idOrbite
    );

    const sigClefPubliqueValide = await this.client.vérifierSignature(
      {
        signature: signatures.publicKey,
        clefPublique: idOrbite,
      },
      clefPublique + signatures.id
    );

    if (!isValidAddress(idBdRacine)) return false;
    const bdRacine = await this.client.ouvrirBd(idBdRacine);
    if (!(bdRacine.access instanceof ContrôleurConstellation)) return false;
    const bdRacineValide = bdRacine.access.estAutorisé(idOrbite);

    return sigIdValide && sigClefPubliqueValide && bdRacineValide;
  }

  async ajouterMembre(info: infoMembre): Promise<void> {
    if (!(await this._validerInfoMembre(info))) return;

    const _ajouterMembre = async (info: infoMembre, récursif = false) => {
      const { idOrbite, idBdRacine } = info;
      await verrouAjouterMembre.acquire(idOrbite);
      const existante = await this.client.rechercherBdListe(
        this.idBd,
        (e: élémentFeedStore<infoMembre>) =>
          e.payload.value.idOrbite === idOrbite
      );
      if (!existante) {
        const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
        await bdRacine.add(info);
      }
      if (!this.fOublierMembres[idBdRacine] && !récursif) {
        const f = async (membres: infoMembre[]) => {
          membres.forEach((m: infoMembre) => _ajouterMembre(m));
        };
        const fOublier = await this.client.suivreBdListeDeClef<infoMembre>(
          idBdRacine,
          "réseau",
          f
        );
        this.fOublierMembres[idBdRacine] = fOublier;
      }

      verrouAjouterMembre.release(idOrbite);
    };

    await _ajouterMembre(info, true);
    this._vu(info);
  }

  _vu(info: infoMembre): void {
    this.dispositifsEnLigne[info.idOrbite] = {
      info,
      vuÀ: new Date().getTime()
    };
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
    f: schémaFonctionSuivi<infoMembreEnLigne[]>
  ): Promise<schémaFonctionOublier> {
    const fFinale = (membres: infoMembre[]) => {
      const maintenant = new Date().getTime();
      const listeMembres = membres.map((m) => {
        const dernierContact = this.dispositifsEnLigne[m.idOrbite].vuÀ;
        const vuIlyA = dernierContact ? maintenant - dernierContact : undefined;
        return Object.assign({ vuIlyA }, m);
      });
      f(listeMembres);
    };
    return await this.client.suivreBdListe(this.idBd, fFinale);
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

  async suivreProjetsMembre(
    id: string,
    f: schémaFonctionSuivi<string[] | undefined>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDeClef(
      id,
      "projets",
      f,
      (id: string, f: schémaFonctionSuivi<string[]>) =>
        this.client.projets!.suivreProjetsMembre(f, id)
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
    const fIdBdDeBranche = (x: unknown) => (x as infoMembre).idBdRacine;
    const fCode = (x: unknown) => (x as infoMembre).idOrbite;

    return await this.client.suivreBdsDeBdListe(
      this.idBd,
      f,
      fBranche,
      fIdBdDeBranche,
      undefined,
      fCode
    );
  }

  async suivreRéplications(
    idBd: string,
    f: schémaFonctionSuivi<infoRéplication[]>
  ): Promise<schémaFonctionOublier> {
    interface infoRéplMembre {
      idBd: string;
      idBdRacineMembre: string;
      idOrbite: string
    }
    const infos: { répls: infoRéplMembre[]; dispositifsEnLigne: infoMembre[] } = {
      répls: [],
      dispositifsEnLigne: [],
    };

    const fFinale = () => {
      const répls = infos.répls
        .filter((r) => r.idBd === idBd)
        .map((r) => {
          const dispositifs = infos.dispositifsEnLigne.filter(
            d=>d.idBdRacine === r.idBdRacineMembre
          )
          const nDispositifsEnLigne = dispositifs.length
          return {
            idBdRacineMembre: r.idBdRacineMembre,
            idOrbite: r.idOrbite
          };
        });
      console.log("fFinale", { infos, répls});
      f(répls);
    };

    const suivreDispositifsEnLigne = setInterval(() => {
      const maintenant = new Date().getTime();
      const dispositifsEnLigne = Object.entries(this.dispositifsEnLigne)
        .filter((e) => maintenant - e[1].vuÀ <= 1000 * 60 * 3 || e[1].info.idOrbite === this.client.orbite!.identity.id)
        .map((e) => e[1].info);
      infos.dispositifsEnLigne = dispositifsEnLigne;
      fFinale();
    }, 10 * 1000);

    const fRacine = (
      répls: infoRéplMembre[]
    ): void => {
      infos.répls = répls
      fFinale()
    }

    const fBranche = async (
      id: string,
      f: schémaFonctionSuivi<infoRéplMembre[]>
    ): Promise<schémaFonctionOublier> => {
      console.log("fBranche", {id})
      const oublierFavoris = await this.suivreFavorisMembre(id, (favoris) => {
        const réplsMembre = (favoris || []).map(fav => {
          return {
            idBd: fav,
            idBdRacineMembre: id,
            //idOrbite: 
          }
        })
        console.log("favoris", réplsMembre)
        f(réplsMembre);
      });
      return oublierFavoris;
    };
    const fIdBdDeBranche = (x: infoMembre) => x.idBdRacine;
    const fCode = (x: infoMembre) => x.idOrbite;

    const oublierMembres = await this.client.suivreBdsDeBdListe(
      this.idBd,
      fRacine,
      fBranche,
      fIdBdDeBranche,
      undefined,
      fCode
    );

    const oublier = () => {
      oublierMembres();
      clearInterval(suivreDispositifsEnLigne);
    };

    return oublier;
  }
}
