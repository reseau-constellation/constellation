import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

import initOrbite from "./orbitdb";
import initSFIP from "./ipfs";
import OrbitDB from "orbit-db";
import { Store, FeedStore, KeyValueStore, élémentFeedStore } from "orbit-db";
import Compte from "./compte";
import BDs from "./bds";
import Tableaux from "./tableaux";
import Variables from "./variables";
import Réseau from "./réseau";
import Favoris from "./favoris";
import uint8ArrayConcat from "uint8arrays/concat";
import Nuée from "./nuée";
import { itérateurÀFlux } from "./utils";
import ContrôleurConstellation, {
  OptionsContrôleurConstellation,
} from "./accès/contrôleurConstellation";

type FileContent =
  | string
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | Iterable<ArrayBuffer | ArrayBufferView>
  | AsyncIterable<ArrayBuffer | ArrayBufferView>;

export type schémaFonctionSuivi = (x: any) => void;

export type schémaFonctionOublier = () => void;

type schémaFonctionRéduction = (branches: unknown[]) => unknown;

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

export interface élémentBdListe {
  payload: {
    value: élémentsBd;
  };
  hash: string;
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

export default class ClientConstellation extends EventEmitter {
  _dir: string;
  optionsAccès?: { [key: string]: any };
  bdRacine?: KeyValueStore;
  _bds: { [key: string]: any };
  orbite?: OrbitDB;
  sfip: any;
  idNodeSFIP?: { [key: string]: any };
  compte?: Compte;
  bds?: BDs;
  tableaux?: Tableaux;
  variables?: Variables;
  réseau?: Réseau;
  favoris?: Favoris;
  nuée?: Nuée;
  pret: boolean;

  constructor(dir = "./sfip-cnstl") {
    super();
    this._dir = dir;
    this._bds = {};
    this.pret = false;
  }

  async initialiser() {
    this.sfip = await initSFIP(this._dir);
    this.idNodeSFIP = await this.sfip.id();
    this.sfip.libp2p.on("peer:connect", async () => {
      console.log("connections", await this.sfip.swarm.peers());
    });

    this.orbite = await initOrbite(this.sfip);

    const idBdRacine = await this.créerBdIndépendante(
      "kvstore",
      undefined,
      "racine"
    );
    this.bdRacine = (await this.ouvrirBd(idBdRacine)) as KeyValueStore;
    await this.bdRacine.load();

    const accès = (this.bdRacine.access as unknown) as ContrôleurConstellation;
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

    const idBdFavoris = await this.obtIdBd("favoris", this.bdRacine, "feed");
    this.favoris = new Favoris(this, idBdFavoris!);

    this.nuée = new Nuée(this);

    this.pret = true;
    this.emit("pret");
  }

  async suivreConnexionsPostes(
    f: schémaFonctionSuivi,
    t = 3000
  ): Promise<schémaFonctionOublier> {
    interface pairSFIP {
      addr: Uint8Array;
      peer: Uint8Array;
    }
    const dédoublerConnexions = (connexions: pairSFIP[]): pairSFIP[] => {
      const adrDéjàVues: string[] = [];
      const dédupliquées: pairSFIP[] = [];
      for (const c of connexions) {
        if (!adrDéjàVues.includes(c.addr.toString())) {
          adrDéjàVues.push(c.addr.toString());
          dédupliquées.push(c);
        }
      }
      return dédupliquées;
    };
    const fFinale = async () => {
      // Enlever les doublons (pas trop sûr ce qu'ils font ici)
      const connexions = await this.sfip.swarm.peers();
      f(dédoublerConnexions(connexions));
    };
    const oublier = setInterval(fFinale, t);
    fFinale();
    return () => clearInterval(oublier);
  }

  async suivreDispositifs(
    f: schémaFonctionSuivi,
    idBdRacine?: string
  ): Promise<schémaFonctionOublier> {
    idBdRacine = idBdRacine || this.bdRacine!.id;
    const bd = await this.ouvrirBd(idBdRacine);
    const accès = bd.access;
    if (accès.type === "ipfs") {
      f(accès.write);
      return () => {
        // Rien à faire
      };
    } else if (accès.type === "controlleur-constellation") {
      console.warn("doit être implémenté");

      return () => {
        //à faire
      };
    } else {
      return () => {
        // Rien à faire
      };
    }
  }

  async suivreBd(
    id: string,
    f: schémaFonctionSuivi,
    événements: string[] = ["write", "replicate", "replicated", "ready"]
  ): Promise<schémaFonctionOublier> {
    const bd = await this.ouvrirBd(id);
    const fFinal = () => f(bd);
    for (const é of événements) {
      bd.events.on(é, fFinal);
    }
    fFinal();
    const oublier = () => {
      événements.forEach((é) => {
        bd.events.off(é, fFinal);
      });
    };
    return oublier;
  }

  async suivreBdDeClef(
    id: string,
    clef: string,
    f: schémaFonctionSuivi,
    fSuivre?: (
      id: string,
      f: schémaFonctionSuivi
    ) => Promise<schémaFonctionOublier>
  ) {
    if (!fSuivre) {
      fSuivre = (id, f) => this.suivreBd(id, f);
    }

    let oublierFSuivre: schémaFonctionOublier | undefined;
    let idBdCible: string | undefined;

    const oublierBdRacine = await this.suivreBd(
      id,
      async (bd: KeyValueStore) => {
        const nouvelIdBdCible = await bd.get(clef);

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
      }
    );

    return () => {
      oublierBdRacine();
      if (oublierFSuivre) oublierFSuivre();
    };
  }

  async suivreBdDicDeClef(
    id: string,
    clef: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (bd: KeyValueStore) => {
      const valeurs = ClientConstellation.obtObjetdeBdDic(bd);
      f(valeurs);
    };
    return await this.suivreBdDeClef(id, clef, fFinale);
  }

  static obtObjetdeBdDic(bd: KeyValueStore): { [key: string]: élémentsBd } {
    const valeurs = bd.all;
    return Object.fromEntries(
      Object.keys(valeurs).map((x) => {
        return [x, valeurs[x]];
      })
    );
  }

  async suivreBdListeDeClef(
    id: string,
    clef: string,
    f: schémaFonctionSuivi,
    renvoyerValeur = true
  ): Promise<schémaFonctionOublier> {
    const fFinale = async (bd: FeedStore) => {
      const éléments = ClientConstellation.obtÉlémentsDeBdListe(
        bd,
        renvoyerValeur
      );
      f(éléments);
    };
    return await this.suivreBdDeClef(id, clef, fFinale);
  }

  async suivreBdListe(
    id: string,
    f: schémaFonctionSuivi,
    renvoyerValeur = true
  ): Promise<schémaFonctionOublier> {
    return await this.suivreBd(id, async (bd) => {
      const éléments = ClientConstellation.obtÉlémentsDeBdListe(
        bd,
        renvoyerValeur
      );
      f(éléments);
    });
  }

  static obtÉlémentsDeBdListe(
    bd: FeedStore,
    renvoyerValeur = true
  ): Array<élémentBdListe | élémentsBd> {
    return bd
      .iterator({ limit: -1 })
      .collect()
      .map((e: élémentBdListe) => (renvoyerValeur ? e.payload.value : e));
  }

  obtÉlémentBdListeSelonEmpreinte(bd: FeedStore, empreinte: string): any {
    return bd
      .iterator({ limit: -1 })
      .collect()
      .find((e: { [key: string]: any }) => e.hash === empreinte).payload.value;
  }

  async suivreBdsDeBdListe(
    id: string,
    f: schémaFonctionSuivi,
    fBranche: (
      id: string,
      f: schémaFonctionSuivi,
      branche?: unknown
    ) => Promise<schémaFonctionOublier | undefined>,
    fIdBdDeBranche: (b: unknown) => string = (b) => b as string,
    fRéduction: schémaFonctionRéduction = (branches: unknown[]) => [
      ...new Set(branches.flat()),
    ],
    fCode: (é: any) => string = (é) => é
  ): Promise<schémaFonctionOublier> {
    interface InterfaceBranches {
      données: any;
      fOublier?: schémaFonctionOublier;
    }
    const arbre: { [key: string]: InterfaceBranches } = {};

    const fFinale = () => {
      const listeDonnées = Object.values(arbre)
        .filter((x) => x.données !== undefined)
        .map((x) => x.données);
      const réduits = fRéduction(listeDonnées);
      f(réduits);
    };

    const fSuivreRacine = async <T>(éléments: Array<T>) => {
      if (éléments.some((x) => typeof fCode(x) !== "string"))
        throw "Définir fCode si les éléments ne sont pas en format texte (chaînes).";
      const dictÉléments = Object.fromEntries(
        éléments.map((é) => [fCode(é), é])
      );
      const existants = Object.keys(arbre);
      const nouveaux = Object.keys(dictÉléments).filter(
        (é) => !existants.includes(é)
      );
      const disparus = existants.filter(
        (é) => !Object.keys(dictÉléments).includes(é)
      );
      for (const d of disparus) {
        const fOublier = arbre[d].fOublier;
        if (fOublier) fOublier();
        delete arbre[d];
        fFinale();
      }
      nouveaux.map(async (n: string) => {
        arbre[n] = { données: undefined };
        const élément = dictÉléments[n];
        const idBdBranche = fIdBdDeBranche(élément);
        const fSuivreBranche = (données: any) => {
          arbre[n].données = données;
          fFinale();
        };
        const fOublier = await fBranche(idBdBranche, fSuivreBranche, élément);
        arbre[n].fOublier = fOublier;
      });
    };

    const oublierBdRacine = await this.suivreBdListe(id, fSuivreRacine);

    const oublier = () => {
      oublierBdRacine();
      Object.values(arbre).map((x) => (x.fOublier ? x.fOublier() : null));
    };
    return oublier;
  }

  async rechercherBdListe(id: string, f: schémaFonctionSuivi): Promise<any> {
    const bd = (await this.ouvrirBd(id)) as FeedStore;
    const élément = bd
      .iterator({ limit: -1 })
      .collect()
      .find((e: élémentFeedStore) => f(e));
    return élément;
  }

  async obtFichierSFIP(id: string, max?: number): Promise<Uint8Array | null> {
    return await toBuffer(this.sfip.cat(id), max);
  }

  obtFluxSFIP(id: string): ReadableStream {
    const itér = this.sfip.cat(id);
    const flux = itérateurÀFlux(itér);
    return flux;
  }

  async ajouterÀSFIP(fichier: FileContent): Promise<string> {
    const résultat = await this.sfip.add(fichier);
    return résultat.cid.toString();
  }

  async ouvrirBd(id: string): Promise<Store> {
    const existante = this._bds[id];
    if (existante) {
      return existante;
    }
    const bd = await this.orbite!.open(id);
    await bd.load();
    this._bds[id] = bd;
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
        idBd = undefined;
      }
    }

    const permission = await this.permissionÉcrire(bdRacine.id);
    if (!idBd && permission && type) {
      idBd = await this.créerBdIndépendante(type, optionsAccès);
      await bdRacine.set(nom, idBd);
    }
    return idBd;
  }

  async créerBdIndépendante(
    type: orbitDbStoreTypes,
    optionsAccès?: OptionsContrôleurConstellation,
    nom?: string
  ): Promise<string> {
    optionsAccès = optionsAccès || this.optionsAccès || {};
    const options: any = {
      accessController: {
        type: "controlleur-constellation",
        premierMod: this.orbite!.identity.id,
      },
    };
    Object.assign(options.accessController, optionsAccès);

    const bd = await this.orbite![type](nom || uuidv4(), options);
    await bd.load();
    return bd.id;
  }

  async _générerBd(type: orbitDbStoreTypes, nom: string): Promise<Store> {
    if (this.orbite!.isValidAddress(nom) && this._bds[nom])
      return this._bds[nom];
    const bd = await this.orbite![type](nom);
    this._bds[bd.id] = bd;
    return bd;
  }

  async effacerBd(id: string): Promise<void> {
    const bd = await this.orbite!.open(id);
    await bd.drop();
    delete this._bds[id];
  }

  async permissionÉcrire(id: string): Promise<boolean> {
    const bd = await this.ouvrirBd(id);
    const accès = bd.access;
    return accès.write.includes(this.orbite!.identity.id);
  }

  async épinglerBd(id: string) {
    const bd = await this.ouvrirBd(id);
    console.error("Doit être implémenté");
  }

  static async créer() {
    const client = new ClientConstellation();
    await client.initialiser();
    return client;
  }
}
