import { FeedStore, élémentFeedStore, isValidAddress } from "orbit-db";
import { EventEmitter } from "events";
import Semaphore from "@chriscdn/promise-semaphore";
import ContrôleurConstellation from "./accès/contrôleurConstellation";

import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
  élémentBdListe,
  élémentsBd,
} from "./client";

export type infoMembre = {
  idSFIP: string;
  idOrbite: string;
  idBdRacine: string;
  clefPublique: string;
  signatures: { id: string; publicKey: string };
};

export interface schémaBd {
  motsClefs?: {
    tous?: string[];
    auMoinsUn?: string[];
  };
  tableaux: {
    vars: string[];
  }[];
}

export type infoMembreEnLigne = infoMembre & {
  vuÀ?: number;
};

export type infoRéplication = {
  idBd: string;
  idBdRacine: string;
  idOrbite: string;
  vuÀ?: number;
};

export type infoDispositifEnLigne = {
  info: infoMembre;
  vuÀ: number;
};

export interface élémentDeMembre<T = élémentsBd> {
  idBdAuteur: string;
  élément: élémentBdListe<T>;
}

const verrouAjouterMembre = new Semaphore();
const INTERVALE_SALUT = 1000 * 60;

export default class Réseau extends EventEmitter {
  client: ClientConstellation;
  idBd: string;
  dispositifsEnLigne: {
    [key: string]: infoDispositifEnLigne;
  };
  fOublierMembres: { [key: string]: schémaFonctionOublier };

  constructor(client: ClientConstellation, id: string) {
    super();

    this.client = client;
    this.idBd = id;
    this.dispositifsEnLigne = {};
    this.fOublierMembres = {};

    // N'oublions pas de nous ajouter nous-mêmes
    const ajouterSoiMême = () => {
      this.ajouterMembre({
        idSFIP: this.client.idNodeSFIP!.id,
        idOrbite: this.client.orbite!.identity.id,
        clefPublique: this.client.orbite!.identity.publicKey,
        signatures: this.client.orbite!.identity.signatures,
        idBdRacine: this.client.bdRacine!.id,
      });
    };
    setInterval(ajouterSoiMême, INTERVALE_SALUT);
    ajouterSoiMême();

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
      vuÀ: new Date().getTime(),
    };
    this.emit("membreVu");
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
    const info: { membres: infoMembre[] } = {
      membres: [],
    };
    const fFinale = () => {
      const listeMembres = info.membres.map((m) => {
        const vuÀ = this.dispositifsEnLigne[m.idOrbite]
          ? this.dispositifsEnLigne[m.idOrbite].vuÀ
          : undefined;
        return Object.assign({ vuÀ }, m);
      });
      f(listeMembres);
    };

    const fSuivreMembres = (membres: infoMembre[]) => {
      info.membres = membres;
      fFinale();
    };
    const oublierMembres = await this.client.suivreBdListe(
      this.idBd,
      fSuivreMembres
    );

    this.on("membreVu", fFinale);
    const oublierVus = () => {
      this.off("membreVu", fFinale);
    };

    const oublier = () => {
      oublierMembres();
      oublierVus();
    };
    return oublier;
  }

  async suivreDispositifsEnLigne(
    f: schémaFonctionSuivi<infoDispositifEnLigne[]>
  ): Promise<schémaFonctionOublier> {
    const fFinale = () => {
      f(Object.values(this.dispositifsEnLigne));
    };
    this.on("membreVu", fFinale);
    fFinale();
    const fOublier = () => {
      this.off("membreVu", fFinale);
    };
    return fOublier;
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
    f: schémaFonctionSuivi<string | undefined>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDeClef(
      idMembre,
      "compte",
      f,
      async (id: string, f: schémaFonctionSuivi<string>) =>
        await this.client.compte!.suivreCourriel(f, id)
    );
  }

  async suivreImageMembre(
    idMembre: string,
    f: schémaFonctionSuivi<Uint8Array | null>
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (image?: Uint8Array | null) => {
      return f(image || null);
    };
    const fSuivre = async (
      id: string,
      f: schémaFonctionSuivi<Uint8Array | null>
    ): Promise<schémaFonctionOublier> => {
      return await this.client.compte!.suivreImage(f, id);
    };
    return await this.client.suivreBdDeClef(
      idMembre,
      "compte",
      fFinale,
      fSuivre
    );
  }

  async suivreBdsMembre(
    id: string,
    f: schémaFonctionSuivi<string[] | undefined>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDeClef(
      id,
      "bds",
      f,
      async (id: string, f: schémaFonctionSuivi<string[]>) =>
        await this.client.bds!.suivreBds(f, id)
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
      async (id: string, f: schémaFonctionSuivi<string[]>) =>
        await this.client.projets!.suivreProjetsMembre(f, id)
    );
  }

  async suivreFavorisMembre(
    id: string,
    f: schémaFonctionSuivi<string[] | undefined>
  ): Promise<schémaFonctionOublier> {
    const fSuivreFavoris = async (
      id: string,
      f: schémaFonctionSuivi<string[]>
    ) => {
      return await this.client.favoris!.suivreFavoris(f, id);
    };
    return await this.client.suivreBdDeClef(id, "bds", f, fSuivreFavoris);
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
    const fListe = async (
      fSuivreRacine: (éléments: infoMembreEnLigne[]) => Promise<void>
    ): Promise<schémaFonctionOublier> => {
      return await this.suivreMembres(fSuivreRacine);
    };

    const fBranche = async (
      idBdRacine: string,
      fSuivreBranche: schémaFonctionSuivi<infoRéplication[]>,
      branche?: infoMembreEnLigne
    ) => {
      const fFinaleSuivreBranche = (favoris?: string[]) => {
        if (!favoris) return;
        const réplications: infoRéplication[] = favoris
          .filter((fav) => fav === idBd)
          .map((fav) => {
            return {
              idBd: fav,
              idBdRacine: branche!.idBdRacine,
              idOrbite: branche!.idOrbite,
              vuÀ: branche!.vuÀ,
            };
          });
        return fSuivreBranche(réplications);
      };
      return await this.suivreFavorisMembre(idBdRacine, fFinaleSuivreBranche);
    };

    const fIdBdDeBranche = (x: infoMembre) => x.idBdRacine;
    const fCode = (x: infoMembre) => x.idOrbite;

    const oublierRéplications = await this.client.suivreBdsDeFonctionListe(
      fListe,
      f,
      fBranche,
      fIdBdDeBranche,
      undefined,
      fCode
    );

    return oublierRéplications;
  }

  async suivreBdsSelonSchéma(
    schéma: schémaBd,
    f: schémaFonctionSuivi<string[]>
  ): Promise<schémaFonctionOublier> {
    const fListe = async (
      fSuivreRacine: (éléments: string[]) => Promise<void>
    ): Promise<schémaFonctionOublier> => {
      return await this.suivreBds(fSuivreRacine);
    };

    const fCondition = async (
      id: string,
      fSuivreCondition: (état: boolean) => void
    ): Promise<schémaFonctionOublier> => {
      const lFOublier: schémaFonctionOublier[] = [];

      const dicÉtat = { motsClefs: false, tableaux: false };
      const fFinale = () => {
        const état = Object.values(dicÉtat).every((x) => x);
        fSuivreCondition(état);
      };

      if (schéma.motsClefs) {
        const fSuivreMotsClefs = (motsClefsBd: string[]) => {
          const { tous, auMoinsUn } = schéma.motsClefs!;
          const étatMotsClefs =
            (tous || []).every((m) => motsClefsBd.includes(m)) &&
            (auMoinsUn || []).some((m) => motsClefsBd.includes(m));
          dicÉtat.motsClefs = étatMotsClefs;
          fFinale();
        };
        lFOublier.push(
          await this.client.bds!.suivreMotsClefsBd(id, fSuivreMotsClefs)
        );
      } else {
        dicÉtat.motsClefs = true;
        fFinale();
      }

      if (schéma.tableaux) {
        const fSuivreTableaux = (tableaux: string[]) => {};
        lFOublier.push(
          await this.client.bds!.suivreTableauxBd(id, fSuivreTableaux)
        );
      } else {
        dicÉtat.tableaux = true;
        fFinale();
      }

      return () => lFOublier.forEach((f) => f());
    };

    return await this.client.suivreBdsSelonCondition(fListe, fCondition, f);
  }

  async suivreÉlémentsBdsSelonSchéma<T extends élémentsBd>(
    schéma: schémaBd,
    iTableau: number,
    f: schémaFonctionSuivi<élémentDeMembre<T>[]>
  ): Promise<schémaFonctionOublier> {
    const fListe = async (
      fSuivreRacine: (éléments: string[]) => Promise<void>
    ): Promise<schémaFonctionOublier> => {
      return await this.suivreBdsSelonSchéma(schéma, fSuivreRacine);
    };

    const fBranche = async (
      id: string,
      f: schémaFonctionSuivi<élémentBdListe<T>[]>
    ): Promise<schémaFonctionOublier> => {
      const idTableau = Error;
      return await this.client.suivreBdListe(idTableau, f, false);
    };

    return await this.client.suivreBdsDeFonctionListe(fListe, f, fBranche);
  }
}
