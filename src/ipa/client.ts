import { EventEmitter } from "events";
import toBuffer from "it-to-buffer";
import all from "it-all";
import { v4 as uuidv4 } from "uuid";

import initOrbite from "./orbitdb";
import initSFIP from "./ipfs";
import Compte from "./compte";
import BDs from "./bds";
import Tableaux from "./tableaux";

type FileContent =
  | string
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | Iterable<ArrayBuffer | ArrayBufferView>
  | AsyncIterable<ArrayBuffer | ArrayBufferView>;

const schémaRacine = {
  compte: "kvstore",
  mesBDs: "feed",
  mesProjets: "feed"
};

export type schémaFonctionSuivi = (x: any) => void;
export type schémaFonctionOublier = () => void;

export default class ClientConstellation extends EventEmitter {
  _dir: string;
  _opsAutoBD: { [key: string]: any } = {};
  _bdRacine: any;
  _bds: { [key: string]: any };
  orbite: any;
  sfip: any;
  compte?: Compte;
  bds?: BDs;
  tableaux?: Tableaux;
  pret: boolean;

  constructor(dir = "./sfip-cnstl") {
    super();
    this._dir = dir;
    this._bds = {};
    this.pret = false;
  }

  async initialiser() {
    this.sfip = await initSFIP(this._dir);
    this.orbite = await initOrbite(this.sfip);
    this._opsAutoBD = {
      accessController: {
        type: "controlleur-constellation",
        premierMod: [this.orbite.identity.id]
      }
    };

    this._bdRacine = await this.orbite.kvstore("racine"); //, this._opsAutoBD);
    await this._bdRacine.load();
    const idBdCompte = await this.obtIdBd("compte", this._bdRacine, "kvstore");
    this.compte = new Compte(this, idBdCompte);

    const idBdBDs = await this.obtIdBd("bds", this._bdRacine, "feed");
    this.bds = new BDs(this, idBdBDs);

    this.tableaux = new Tableaux(this);

    this.pret = true;
    this.emit("pret");
  }

  async suivreBD(
    id: string,
    f: schémaFonctionSuivi,
    événements: string[] = ["write", "replicated", "ready"]
  ): Promise<schémaFonctionOublier> {
    const bd = await this.ouvrirBD(id);
    const fFinal = () => f(bd);
    for (const é of événements) {
      bd.events.on(é, fFinal);
    }
    fFinal();
    const oublier = () => {
      événements.forEach(é => {
        bd.events.off(é, fFinal);
      });
    };
    return oublier;
  }

  async suivreBdDic(
    id: string,
    clef: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const idBdDic = await this.obtIdBd(clef, id, "kvstore");
    return await this.suivreBD(idBdDic, async bd => {
      let valeurs = bd.all;
      valeurs = Object.fromEntries(
        Object.keys(valeurs).map(x => {
          return [x, valeurs[x]];
        })
      );
      f(valeurs);
    });
  }

  async suivreBdListe(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.suivreBD(id, async bd => {
      const éléments = bd
        .iterator({ limit: -1 })
        .collect()
        .map((e: { [key: string]: any }) => e.payload.value);
      f(éléments);
    });
  }

  async obtFichierSFIP(id: string, max?: number) {
    return await toBuffer(this.sfip.cat(id));
  }

  async ajouterÀSFIP(fichier: FileContent): Promise<string> {
    const résultat = await this.sfip.add(fichier);
    return résultat.cid.toString();
  }

  async effacerDeSFIP(id: string) {
    return;
  }

  async ouvrirBD(id: string) {
    const existante = this._bds[id];
    if (existante) {
      return existante;
    }
    const bd = await this.orbite.open(id);
    this._bds[id] = bd;
    await bd.load();
    return bd;
  }

  async obtIdBd(nom: string, racine: any, type?: string): Promise<string> {
    if (typeof racine === "string") {
      racine = await this.ouvrirBD(racine);
    }
    let idBd = await racine.get(nom);
    let bd;

    // Nous devons confirmer que la base de données spécifiée était du bon genre
    if (idBd && type) {
      try {
        bd = await this.orbite[type](idBd);
        return idBd;
      } catch {
        idBd = null;
      }
    }
    if (!idBd && this.permissionÉcrire(racine) && type) {
      bd = await this.orbite[type](uuidv4());
      idBd = bd.id;
      await racine.set(nom, idBd);
    }
    return idBd;
  }

  async créerBDIndépendante(type: string): Promise<string> {
    const bd = await this.orbite[type](uuidv4());
    return bd.id;
  }

  async effacerBD(id: string): Promise<void> {
    const bd = await this.orbite.open(id);
    await bd.drop();
    delete this._bds[id];
  }

  async permissionÉcrire(id: string) {
    const bd = await this.ouvrirBD(id);
    const accès = bd.access;
    return accès.write.includes(this.orbite.identity._id);
  }

  static async créer() {
    const client = new ClientConstellation();
    await client.initialiser();
    return client;
  }
}
