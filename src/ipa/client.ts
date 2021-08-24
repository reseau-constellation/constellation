import IPFS from "ipfs";
import { IDResult } from "ipfs-core-types/src/root";
import { ImportCandidate } from "ipfs-core-types/src/utils";

import { EventEmitter, once } from "events";
import { v4 as uuidv4 } from "uuid";
import Semaphore from "@chriscdn/promise-semaphore";
import initOrbite from "./orbitdb";
import initSFIP from "./ipfs";

import OrbitDB, {
  Store,
  FeedStore,
  KeyValueStore,
  isValidAddress,
  élémentFeedStore,
} from "orbit-db";
import AccessController from "orbit-db-access-controllers/src/access-controller-interface";
import uint8ArrayConcat from "uint8arrays/concat";

import Compte from "./compte";
import BDs from "./bds";
import Tableaux from "./tableaux";
import Variables from "./variables";
import Réseau from "./réseau";
import Favoris from "./favoris";
import Projets from "./projets";
import MotsClefs from "./motsClefs";

import { itérateurÀFlux } from "./utils";
import ContrôleurConstellation, {
  OptionsContrôleurConstellation,
  nomType as nomTypeContrôleurConstellation,
} from "./accès/contrôleurConstellation";

import { objRôles, infoUtilisateur } from "./accès/types"
import { MEMBRE, MODÉRATEUR, rôles } from "./accès/consts";

export type schémaFonctionSuivi<T> = (x: T) => void;

export type schémaFonctionOublier = () => void;

type schémaFonctionRéduction<T, U> = (branches: T) => U;

type orbitDbStoreTypes =
  | "counter"
  | "eventlog"
  | "feed"
  | "docstore"
  | "keyvalue"
  | "kvstore";

export type élémentsBd =
  | number
  | boolean
  | string
  | { [key: string]: élémentsBd }
  | Array<élémentsBd>;

export interface élémentBdListe<T = élémentsBd> {
  payload: {
    value: T;
  };
  hash: string;
}

export type infoAccès = {
  idBdRacine: string;
  rôle: keyof objRôles;
};

export interface Signature {
  signature: string;
  clefPublique: string;
}

// Identique à it-to-buffer, mais avec option de maximum de taille
async function toBuffer(
  stream: AsyncIterable<Uint8Array> | Iterable<Uint8Array>,
  max?: number
): Promise<Uint8Array | null> {
  let buffer = new Uint8Array(0);

  for await (const buf of stream) {
    buffer = uint8ArrayConcat([buffer, buf], buffer.length + buf.length);
    if (max !== undefined && buffer.length > max) return null;
  }

  return buffer;
}

const verrouOuvertureBd = new Semaphore();

export function adresseOrbiteValide(adresse: unknown): boolean {
  return (
    typeof adresse === "string" &&
    adresse.startsWith("/orbitdb/") &&
    isValidAddress(adresse)
  );
}

class ÉmetteurUneFois<T> extends EventEmitter {
  résultatPrêt: boolean;
  fOublier?: schémaFonctionOublier;
  résultat?: T;
  f: (fSuivi: schémaFonctionSuivi<T>) => Promise<schémaFonctionOublier>;

  constructor(
    f: (fSuivi: schémaFonctionSuivi<T>) => Promise<schémaFonctionOublier>
  ) {
    super();
    this.résultatPrêt = false;
    this.f = f;
    this.initialiser();
  }
  async initialiser() {
    const fSuivre = async (résultat: T) => {
      this.résultat = résultat;
      this.résultatPrêt = true;
      if (this.fOublier) this.lorsquePrêt();
    };

    this.fOublier = await this.f(fSuivre);
    this.lorsquePrêt();
  }
  lorsquePrêt() {
    if (this.résultatPrêt) {
      if (!this.fOublier) throw new Error("Fuite !!");
      if (this.fOublier) this.fOublier();
      this.emit("fini", this.résultat);
    }
  }
}

const uneFois = async function <T>(
  f: (fSuivi: schémaFonctionSuivi<T>) => Promise<schémaFonctionOublier>
): Promise<T> {
  const test = new ÉmetteurUneFois(f);
  const résultat = (await once(test, "fini")) as [T];
  return résultat[0];
};

const faisRien = () => {
  //Rien à faire
};

export default class ClientConstellation extends EventEmitter {
  _dir: string;
  optionsAccès?: { [key: string]: unknown };
  bdRacine?: KeyValueStore;
  _bds: { [key: string]: Store };
  orbite?: OrbitDB;
  sfip?: IPFS.IPFS;
  idNodeSFIP?: IDResult;
  compte?: Compte;
  bds?: BDs;
  tableaux?: Tableaux;
  variables?: Variables;
  réseau?: Réseau;
  favoris?: Favoris;
  projets?: Projets;
  motsClefs?: MotsClefs;
  prêt: boolean;
  idBdRacine?: string;
  SUJET_RÉSEAU: string;

  constructor(
    idBdRacine?: string,
    dir = "./sfip-cnstl",
    orbitdb?: OrbitDB,
    sujetRéseau = "réseau-constellation"
  ) {
    super();
    this._dir = dir;
    this._bds = {};
    this.prêt = false;
    this.idBdRacine = idBdRacine;
    this.orbite = orbitdb;
    this.SUJET_RÉSEAU = sujetRéseau;
  }

  async initialiser(): Promise<void> {
    if (this.orbite) {
      this.sfip = this.orbite._ipfs;
    } else {
      this.sfip = await initSFIP(this._dir);
    }
    this.idNodeSFIP = await this.sfip!.id();

    if (!this.orbite) this.orbite = await initOrbite(this.sfip!);

    const optionsAccèsRacine = {
      type: "controlleur-constellation",
      premierMod: this.orbite!.identity.id,
      nom: "racine",
    };
    if (!this.idBdRacine) {
      this.idBdRacine = await this.créerBdIndépendante(
        "kvstore",
        optionsAccèsRacine,
        "racine"
      );
    }

    await this.initialiserBds();

    this.prêt = true;
    this.emit("prêt");

    //On commence par épingler notre compte (de manière récursive)
    //afin de le rendre disponible
    await this.épinglerBd(this.idBdRacine);
  }

  async initialiserBds(): Promise<void> {
    this.bdRacine = (await this.ouvrirBd(this.idBdRacine!)) as KeyValueStore;
    await this.bdRacine.load();

    const accès = this.bdRacine.access as unknown as ContrôleurConstellation;
    this.optionsAccès = {
      type: "controlleur-constellation",
      adresseBd: accès.bd!.address,
    };

    const idBdCompte = await this.obtIdBd("compte", this.bdRacine, "kvstore");
    this.compte = new Compte(this, idBdCompte!);

    const idBdBDs = await this.obtIdBd("bds", this.bdRacine, "feed");
    this.bds = new BDs(this, idBdBDs!);

    this.tableaux = new Tableaux(this);

    const idBdVariables = await this.obtIdBd(
      "variables",
      this.bdRacine,
      "feed"
    );
    this.variables = new Variables(this, idBdVariables!);

    const idBdRéseau = await this.obtIdBd("réseau", this.bdRacine, "feed");
    this.réseau = new Réseau(this, idBdRéseau!);
    await this.réseau.initialiser();

    const idBdFavoris = await this.obtIdBd("favoris", this.bdRacine, "feed");
    this.favoris = new Favoris(this, idBdFavoris!);

    const idBdProjets = await this.obtIdBd("projets", this.bdRacine, "feed");
    this.projets = new Projets(this, idBdProjets!);

    const idBdMotsClefs = await this.obtIdBd(
      "motsClefs",
      this.bdRacine,
      "feed"
    );
    this.motsClefs = new MotsClefs(this, idBdMotsClefs!);
  }

  async signer(message: string): Promise<Signature> {
    const id = this.orbite!.identity;
    const signature = await this.orbite!.identity.provider.sign(id, message);
    const clefPublique = this.orbite!.identity.publicKey;
    return { signature, clefPublique };
  }

  async vérifierSignature(
    signature: Signature,
    message: string
  ): Promise<boolean> {
    if (!signature || !signature.clefPublique || !signature.signature)
      return false;
    return await this.orbite!.identity.provider.verify(
      signature.signature,
      signature.clefPublique,
      message
    );
  }

  async suivreDispositifs(
    f: schémaFonctionSuivi<string[]>,
    idBdRacine?: string
  ): Promise<schémaFonctionOublier> {
    if (!this.bdRacine) await once(this, "prêt");
    idBdRacine = idBdRacine || this.bdRacine!.id;
    const bd = await this.ouvrirBd(idBdRacine);
    const accès = bd.access;

    const typeAccès = (accès.constructor as unknown as AccessController).type;
    if (typeAccès === "ipfs") {
      f(accès.write);
      return faisRien;
    } else if (typeAccès === "controlleur-constellation") {
      const fFinale = () => {
        const mods = (accès as unknown as ContrôleurConstellation).gestRôles._rôles[
          MODÉRATEUR
        ];
        f(mods);
      };
      accès.on("updated", fFinale);
      fFinale();
      return () => {
        accès.off("updated", fFinale);
      };
    } else {
      return faisRien;
    }
  }

  async ajouterDispositif(identité: string): Promise<void> {
    if (!this.bdRacine) await once(this, "prêt");
    const accès = this.bdRacine!.access as unknown as ContrôleurConstellation;
    accès.grant(MODÉRATEUR, identité);
  }

  async enleverDispositif(identité: string): Promise<void> {
    if (!this.bdRacine) await once(this, "prêt");
    const accès = this.bdRacine!.access as unknown as ContrôleurConstellation;
    await accès.revoke(MODÉRATEUR, identité);
  }

  async rejoindreCompte(idBdRacine: string): Promise<void> {
    if (!adresseOrbiteValide(idBdRacine))
      throw new Error(`Adresse compte ${idBdRacine} non valide`);
    this.idBdRacine = idBdRacine;
    await this.initialiserBds();
    this.emit("compteChangé");
  }

  async donnerAccès(
    idBd: string,
    identité: string,
    rôle: keyof objRôles = MEMBRE
  ): Promise<void> {
    if (!adresseOrbiteValide(identité))
      throw new Error(`Identité ${identité} non valide.`);

    const bd = await this.ouvrirBd(idBd);
    const accès = bd.access;
    const typeAccès = (accès.constructor as unknown as AccessController).type;
    if (typeAccès === nomTypeContrôleurConstellation) {
      (accès as unknown as ContrôleurConstellation).grant(rôle, identité);
    }
  }

  async suivreAccès(
    id: string,
    f: schémaFonctionSuivi<objRôles>
  ): Promise<schémaFonctionOublier> {
    const bd = await this.ouvrirBd(id);
    const accès = bd.access as unknown as ContrôleurConstellation;
    const fFinale = () => {
      const autorisés = accès.gestRôles._rôles;
      f(autorisés);
    };
    accès.on("misÀJour", fFinale);
    return () => {
      accès.off("misÀJour", fFinale);
    };
  }

  async suivreIdBdRacine(
    f: schémaFonctionSuivi<string | undefined>
  ): Promise<schémaFonctionOublier> {
    const fFinale = () => f(this.idBdRacine);
    this.on("compteChangé", fFinale);
    fFinale();
    return () => this.off("compteChangé", fFinale);
  }

  async suivreIdOrbite(
    f: schémaFonctionSuivi<string | undefined>
  ): Promise<schémaFonctionOublier> {
    f(this.orbite!.identity.id);
    return faisRien;
  }

  async copierContenuBdListe(
    bdBase: KeyValueStore,
    nouvelleBd: KeyValueStore,
    clef: string
  ): Promise<void> {
    const idBdListeInit = await bdBase.get(clef);
    if (!idBdListeInit) return;

    const bdListeInit = (await this.ouvrirBd(idBdListeInit)) as FeedStore;

    const idNouvelleBdListe = await nouvelleBd.get(clef);
    if (!idNouvelleBdListe) throw "La nouvelle BD n'existait pas";

    const nouvelleBdListe = (await this.ouvrirBd(
      idNouvelleBdListe
    )) as FeedStore;

    const données = ClientConstellation.obtÉlémentsDeBdListe(bdListeInit);
    données.forEach(async (d) => {
      await nouvelleBdListe.add(d);
    });
  }

  async suivreBd<T extends Store>(
    id: string,
    f: schémaFonctionSuivi<T>,
    événements: string[] = ["write", "replicated", "ready"]
  ): Promise<schémaFonctionOublier> {
    const bd = await this.ouvrirBd<T>(id);

    const fFinale = () => f(bd);
    for (const é of événements) {
      bd.events.on(é, fFinale);
    }
    fFinale();
    const oublier = () => {
      événements.forEach((é) => {
        bd.events.off(é, fFinale);
      });
    };
    return oublier;
  }

  async suivreBdDeFonction<T>(
    fRacine: (
      fSuivreRacine: (nouvelIdBdCible: string) => Promise<void>
    ) => Promise<schémaFonctionOublier>,
    f: schémaFonctionSuivi<T | undefined>,
    fSuivre?: (
      id: string,
      fSuivreBd: schémaFonctionSuivi<T>
    ) => Promise<schémaFonctionOublier>
  ): Promise<schémaFonctionOublier> {
    if (!fSuivre) {
      fSuivre = async (id, fSuivreBd: schémaFonctionSuivi<T>) =>
        await this.suivreBd(
          id,
          fSuivreBd as unknown as schémaFonctionSuivi<KeyValueStore>
        );
    }

    let oublierFSuivre: schémaFonctionOublier | undefined;
    let idBdCible: string | undefined;

    const oublierRacine = await fRacine(async (nouvelIdBdCible: string) => {
      if (nouvelIdBdCible !== idBdCible) {
        idBdCible = nouvelIdBdCible;
        if (oublierFSuivre) oublierFSuivre();

        if (idBdCible) {
          oublierFSuivre = await fSuivre!(idBdCible, f);
        } else {
          f(undefined);
          oublierFSuivre = undefined;
        }
      }
    });
    return () => {
      oublierRacine();
      if (oublierFSuivre) oublierFSuivre();
    };
  }

  async suivreBdDeClef<T>(
    id: string,
    clef: string,
    f: schémaFonctionSuivi<T | undefined>,
    fSuivre?: (
      id: string,
      fSuivreBd: schémaFonctionSuivi<T>
    ) => Promise<schémaFonctionOublier>
  ): Promise<schémaFonctionOublier> {
    const fRacine = async (
      fSuivreRacine: (nouvelIdBdCible: string) => Promise<void>
    ): Promise<schémaFonctionOublier> => {
      const fSuivreBdRacine = async (bd: KeyValueStore) => {
        const nouvelIdBdCible = await bd.get(clef);
        fSuivreRacine(nouvelIdBdCible);
      };
      return await this.suivreBd(id, fSuivreBdRacine);
    };
    return await this.suivreBdDeFonction(fRacine, f, fSuivre);
  }

  async suivreBdDicDeClef<T extends élémentsBd>(
    id: string,
    clef: string,
    f: schémaFonctionSuivi<{ [key: string]: T }>
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (bd?: KeyValueStore) => {
      const valeurs = bd ? ClientConstellation.obtObjetdeBdDic<T>(bd) : {};
      f(valeurs);
    };
    return await this.suivreBdDeClef(id, clef, fFinale);
  }

  static obtObjetdeBdDic<T extends élémentsBd>(
    bd: KeyValueStore
  ): { [key: string]: T } {
    const valeurs = bd.all;
    return Object.fromEntries(
      Object.keys(valeurs).map((x) => {
        return [x, valeurs[x]];
      })
    );
  }

  async suivreBdListeDeClef<T extends élémentsBd>(
    id: string,
    clef: string,
    f: schémaFonctionSuivi<T[]>,
    renvoyerValeur?: true
  ): Promise<schémaFonctionOublier>;
  async suivreBdListeDeClef<T extends élémentsBd>(
    id: string,
    clef: string,
    f: schémaFonctionSuivi<élémentBdListe<T>[]>,
    renvoyerValeur: false
  ): Promise<schémaFonctionOublier>;
  async suivreBdListeDeClef<T extends élémentsBd>(
    id: string,
    clef: string,
    f: schémaFonctionSuivi<T[] | élémentBdListe<T>[]>,
    renvoyerValeur = true
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (bd?: FeedStore) => {
      const éléments = bd
        ? ClientConstellation.obtÉlémentsDeBdListe<T>(bd, renvoyerValeur)
        : [];
      f(éléments);
    };
    return await this.suivreBdDeClef(id, clef, fFinale);
  }

  async suivreBdListe<T extends élémentsBd>(
    id: string,
    f: schémaFonctionSuivi<T[]>,
    renvoyerValeur?: true
  ): Promise<schémaFonctionOublier>;
  async suivreBdListe<T extends élémentsBd>(
    id: string,
    f: schémaFonctionSuivi<élémentBdListe<T>[]>,
    renvoyerValeur: false
  ): Promise<schémaFonctionOublier>;
  async suivreBdListe<T extends élémentsBd>(
    id: string,
    f: schémaFonctionSuivi<T[] | élémentBdListe<T>[]>,
    renvoyerValeur = true
  ): Promise<schémaFonctionOublier> {
    return await this.suivreBd(id, async (bd) => {
      const éléments = ClientConstellation.obtÉlémentsDeBdListe<T>(
        bd as FeedStore,
        renvoyerValeur
      );
      f(éléments);
    });
  }

  static obtÉlémentsDeBdListe<T extends élémentsBd>(
    bd: FeedStore,
    renvoyerValeur?: true
  ): T[];
  static obtÉlémentsDeBdListe<T extends élémentsBd>(
    bd: FeedStore,
    renvoyerValeur: false
  ): élémentBdListe<T>[];
  static obtÉlémentsDeBdListe<T extends élémentsBd>(
    bd: FeedStore,
    renvoyerValeur?: boolean
  ): T[] | élémentBdListe<T>[];
  static obtÉlémentsDeBdListe<T extends élémentsBd>(
    bd: FeedStore,
    renvoyerValeur = true
  ): T[] | élémentBdListe<T>[] {
    return bd
      .iterator({ limit: -1 })
      .collect()
      .map((e: élémentBdListe<T>) => (renvoyerValeur ? e.payload.value : e));
  }

  obtÉlémentBdListeSelonEmpreinte(
    bd: FeedStore,
    empreinte: string
  ): élémentsBd {
    return bd
      .iterator({ limit: -1 })
      .collect()
      .find((e: élémentBdListe) => e.hash === empreinte).payload.value;
  }

  async suivreBdsDeBdListe<T extends élémentsBd, U, V>(
    id: string,
    f: schémaFonctionSuivi<V[]>,
    fBranche: (
      id: string,
      f: schémaFonctionSuivi<U>,
      branche?: T
    ) => Promise<schémaFonctionOublier | undefined>,
    fIdBdDeBranche: (b: T) => string = (b) => b as string,
    fRéduction: schémaFonctionRéduction<U[], V[]> = (branches: U[]) =>
      [...new Set(branches.flat())] as unknown as V[],
    fCode: (é: T) => string = (é) => é as string
  ): Promise<schémaFonctionOublier> {
    const fListe = async (
      fSuivreRacine: (éléments: T[]) => Promise<void>
    ): Promise<schémaFonctionOublier> => {
      return await this.suivreBdListe(id, fSuivreRacine);
    };
    return await this.suivreBdsDeFonctionListe(
      fListe,
      f,
      fBranche,
      fIdBdDeBranche,
      fRéduction,
      fCode
    );
  }

  async suivreBdsDeFonctionListe<T extends élémentsBd, U, V>(
    fListe: (
      fSuivreRacine: (éléments: T[]) => Promise<void>
    ) => Promise<schémaFonctionOublier>,
    f: schémaFonctionSuivi<V[]>,
    fBranche: (
      id: string,
      f: schémaFonctionSuivi<U>,
      branche?: T
    ) => Promise<schémaFonctionOublier | undefined>,
    fIdBdDeBranche: (b: T) => string = (b) => b as string,
    fRéduction: schémaFonctionRéduction<U[], V[]> = (branches: U[]) =>
      [...new Set(branches.flat())] as unknown as V[],
    fCode: (é: T) => string = (é) => é as string
  ): Promise<schémaFonctionOublier> {
    interface InterfaceBranches {
      données?: U;
      fOublier?: schémaFonctionOublier;
    }
    const arbre: { [key: string]: InterfaceBranches } = {};
    const dictBranches: { [key: string]: T } = {};

    let prêt = false; // Afin d'éviter d'appeler fFinale() avant que toutes les branches aient été évaluées 1 fois

    const fFinale = () => {
      //if (!prêt) return;

      const listeDonnées = Object.values(arbre)
        .map((x) => x.données)
        .filter((d) => d !== undefined) as U[];
      const réduits = fRéduction(listeDonnées);
      if (!prêt) return;
      f(réduits);
    };

    const fSuivreRacine = async (éléments: Array<T>) => {

      if (éléments.some((x) => typeof fCode(x) !== "string"))
        throw "Définir fCode si les éléments ne sont pas en format texte (chaînes).";
      const dictÉléments = Object.fromEntries(
        éléments.map((é) => [fCode(é), é])
      );
      const existants = Object.keys(arbre);
      let nouveaux = Object.keys(dictÉléments).filter(
        (é) => !existants.includes(é)
      );
      const disparus = existants.filter(
        (é) => !Object.keys(dictÉléments).includes(é)
      );
      const changés = Object.entries(dictÉléments)
        .filter((é) => {
          return dictBranches[é[0]] !== é[1];
        })
        .map((é) => é[0]);
      nouveaux.push(...changés);
      nouveaux = [...new Set(nouveaux)];

      for (const c of changés) {
        if (arbre[c]) {
          const fOublier = arbre[c].fOublier;
          if (fOublier) fOublier();
          delete arbre[c];
        }
      }

      for (const d of disparus) {
        const fOublier = arbre[d].fOublier;
        if (fOublier) fOublier();
        delete arbre[d];
        fFinale();
      }

      await Promise.all(
        nouveaux.map(async (n: string) => {
          arbre[n] = { données: undefined };
          const élément = dictÉléments[n];
          dictBranches[n] = élément;

          const idBdBranche = fIdBdDeBranche(élément);
          const fSuivreBranche = (données: U) => {
            arbre[n].données = données;
            fFinale();
          };
          const fOublier = await fBranche(idBdBranche, fSuivreBranche, élément);
          arbre[n].fOublier = fOublier;
        })
      );

      prêt = true;
      fFinale();
    };

    const oublierBdRacine = await fListe(fSuivreRacine);

    const oublier = () => {
      oublierBdRacine();
      Object.values(arbre).map((x) => (x.fOublier ? x.fOublier() : null));
    };
    return oublier;
  }

  async suivreBdsSelonCondition(
    fListe: (
      fSuivreRacine: (ids: string[]) => Promise<void>
    ) => Promise<schémaFonctionOublier>,
    fCondition: (
      id: string,
      fSuivreCondition: (état: boolean) => void
    ) => Promise<schémaFonctionOublier>,
    f: schémaFonctionSuivi<string[]>
  ): Promise<schémaFonctionOublier> {
    interface branche {
      id: string;
      état: boolean;
    }

    const fFinale = (éléments: branche[]) => {
      const bdsRecherchées = éléments
        .filter((él) => él.état)
        .map((él) => él.id);
      f(bdsRecherchées);
    };

    const fBranche = async (
      id: string,
      fSuivreBranche: schémaFonctionSuivi<branche>
    ): Promise<schémaFonctionOublier> => {
      const fFinaleSuivreBranche = (état: boolean) => {
        fSuivreBranche({ id, état });
      };
      return await fCondition(id, fFinaleSuivreBranche);
    };

    return await this.suivreBdsDeFonctionListe(fListe, fFinale, fBranche);
  }

  async rechercherBdListe<T>(
    id: string,
    f: (e: élémentFeedStore<T | undefined>) => boolean
  ): Promise<élémentFeedStore<T>> {
    const bd = (await this.ouvrirBd(id)) as FeedStore;
    const élément = bd
      .iterator({ limit: -1 })
      .collect()
      .find((e: élémentFeedStore<T>) => f(e));
    return élément;
  }

  async obtFichierSFIP(id: string, max?: number): Promise<Uint8Array | null> {
    return await toBuffer(this.sfip!.cat(id), max);
  }

  obtFluxSFIP(id: string): ReadableStream {
    const itér = this.sfip!.cat(id);
    const flux = itérateurÀFlux(itér);
    return flux;
  }

  async ajouterÀSFIP(fichier: ImportCandidate): Promise<string> {
    const résultat = await this.sfip!.add(fichier);
    return résultat.cid.toString();
  }

  async ouvrirBd<T extends Store>(id: string): Promise<T> {
    if (!adresseOrbiteValide(id)) throw new Error(`Adresse ${id} non valide.`);

    //Nous avons besoin d'un verrou afin d'éviter la concurrence
    await verrouOuvertureBd.acquire(id);
    const existante = this._bds[id] as T | undefined;
    if (existante) {
      verrouOuvertureBd.release(id);
      return existante;
    }
    const bd = (await this.orbite!.open(id)) as T;
    await bd.load();
    this._bds[id] = bd;

    //Maintenant que la BD a été créée, on peut relâcher le verrou
    verrouOuvertureBd.release(id);
    return bd;
  }

  async obtIdBd(
    nom: string,
    racine: string | KeyValueStore,
    type?: orbitDbStoreTypes,
    optionsAccès?: OptionsContrôleurConstellation
  ): Promise<string | undefined> {
    let bdRacine: KeyValueStore;
    if (typeof racine === "string") {
      bdRacine = (await this.ouvrirBd(racine)) as KeyValueStore;
    } else {
      bdRacine = racine;
    }
    let idBd = await bdRacine.get(nom);

    // Nous devons confirmer que la base de données spécifiée était du bon genre
    if (idBd && type) {
      try {
        await this.orbite![type](idBd);
        return idBd;
      } catch {
        return;
      }
    }

    if (!idBd && type) {
      const accès = bdRacine.access as ContrôleurConstellation;
      const permission = await uneFois((f: schémaFonctionSuivi<boolean>) =>
        accès.suivreIdsOrbiteAutoriséesÉcriture((autorisés: string[]) =>
          f(autorisés.includes(this.orbite!.identity.id))
        )
      );

      if (permission) {
        idBd = await this.créerBdIndépendante(type, optionsAccès);
        await bdRacine.set(nom, idBd);
      }
    }
    return idBd;
  }

  async créerBdIndépendante(
    type: orbitDbStoreTypes,
    optionsAccès?: OptionsContrôleurConstellation,
    nom?: string
  ): Promise<string> {
    optionsAccès = Object.assign({}, this.optionsAccès, optionsAccès || {});
    const options = {
      accessController: optionsAccès,
    };
    const bd = await this.orbite![type](nom || uuidv4(), options);
    await bd.load();
    const { id } = bd;
    this._bds[id] = bd;

    return id;
  }

  async effacerBd(id: string): Promise<void> {
    const bd = await this.ouvrirBd(id);
    await bd.drop();
    delete this._bds[id];
  }

  async obtOpsAccès(idBd: string): Promise<OptionsContrôleurConstellation> {
    const bd = await this.ouvrirBd(idBd);
    const accès = bd.access as unknown as ContrôleurConstellation;
    return {
      adresseBd: accès.bd!.address,
    };
  }

  async suivrePermission(
    id: string,
    f: schémaFonctionSuivi<typeof rôles[number] | undefined>
  ): Promise<schémaFonctionOublier> {
    const moi = this.orbite!.identity.id;
    const bd = await this.ouvrirBd(id);
    const accès = bd.access;
    const typeAccès = (accès.constructor as unknown as AccessController).type;

    if (typeAccès === "ipfs") {
      f(accès.write.includes(moi) ? MEMBRE : undefined);
      return faisRien;
    } else if (typeAccès === nomTypeContrôleurConstellation) {
      const fFinale = (utilisateurs: infoUtilisateur[]) => {
        const mesRôles = utilisateurs
          .filter((u) => u.idBdRacine === this.idBdRacine)
          .map((u) => u.rôle);
        const rôlePlusPuissant = mesRôles.includes(MODÉRATEUR)
          ? MODÉRATEUR
          : mesRôles.includes(MEMBRE)
          ? MEMBRE
          : undefined;
        f(rôlePlusPuissant);
      };
      return await accès.suivreUtilisateursAutorisés(fFinale);
    } else {
      throw new Error(typeAccès);
    }
  }

  async suivrePermissionÉcrire(
    id: string,
    f: schémaFonctionSuivi<boolean>
  ): Promise<schémaFonctionOublier> {
    const fFinale = (rôle?: typeof rôles[number]) => {
      f(rôle !== undefined);
    };
    return await this.suivrePermission(id, fFinale);
  }

  async suivreAccèsBd(
    id: string,
    f: schémaFonctionSuivi<infoAccès[]>
  ): Promise<schémaFonctionOublier> {
    const bd = await this.ouvrirBd(id);
    const accès = bd.access as unknown as AccessController;
    const typeAccès = (accès.constructor as unknown as AccessController).type;

    if (typeAccès === "ipfs") {
      const listeAccès: infoAccès[] = accès.write.map((id) => {
        return {
          idBdRacine: id,
          rôle: MODÉRATEUR,
        };
      });
      f(listeAccès);
    } else if (typeAccès === nomTypeContrôleurConstellation) {
      const fOublier = await (
        accès as ContrôleurConstellation
      ).suivreUtilisateursAutorisés(f);
      return fOublier;
    }
    return faisRien;
  }

  async épinglerBd(id: string, déjàVus: string[] = []): Promise<void> {
    if (déjàVus.includes(id)) return;
    const bd = await this.ouvrirBd(id);
    déjàVus.push(id);
    const épinglerSiAdresseValide = (x: unknown) => {
      if (adresseOrbiteValide(x)) {
        this.épinglerBd(x as string, déjàVus);
      }
    };

    //Cette fonction détectera les éléments d'une liste ou d'un dictionnaire
    //(à un niveau de profondeur) qui représentent une adresse de BD Orbit.
    const analyserItem = (x: unknown) => {
      if (typeof x === "object") {
        Object.values(x as { [key: string]: unknown }).forEach((y: unknown) =>
          épinglerSiAdresseValide(y)
        );
      } else if (Array.isArray(x)) {
        x.forEach((y) => épinglerSiAdresseValide(y));
      } else {
        épinglerSiAdresseValide(x);
      }
    };
    if (bd.type === "keyvalue") {
      const items = Object.values(
        ClientConstellation.obtObjetdeBdDic(bd as KeyValueStore)
      );
      items.forEach(analyserItem);
    } else if (bd.type === "feed") {
      const items = ClientConstellation.obtÉlémentsDeBdListe(bd as FeedStore);
      items.forEach(analyserItem);
    }
  }

  async fermer(): Promise<void> {
    await Promise.all(
      Object.values(this._bds).map(async (bd) => await bd.close())
    );

    if (this.réseau) await this.réseau.fermer();
    if (this.orbite) await this.orbite.stop();
    if (this.sfip) await this.sfip.stop();
  }

  static async créer(
    idBdRacine?: string,
    dir = "./sfip-cnstl",
    orbitdb?: OrbitDB,
    sujetRéseau = "réseau-constellation"
  ): Promise<ClientConstellation> {
    const client = new ClientConstellation(
      idBdRacine,
      dir,
      orbitdb,
      sujetRéseau
    );
    await client.initialiser();
    return client;
  }
}
