import { EventEmitter } from "events";
import toBuffer from "it-to-buffer";
import all from "it-all";
import { v4 as uuidv4 } from "uuid";

import initOrbite from "./orbitdb";
import initSFIP from "./ipfs";
import Compte from "./compte";

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

export type schémaFonctionSuivi = (bd: any) => void;

export default class ClientConstellation extends EventEmitter {
  _dir: string;
  _opsAutoBD: { [key: string]: any } = {};
  _bdRacine: any;
  _bds: { [key: string]: any };
  orbite: any;
  sfip: any;
  compte?: Compte;
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
    const idBdCompte = await this.créerBD("compte", this._bdRacine, "kvstore");
    this.compte = new Compte(this, idBdCompte);
    this.pret = true;
    this.emit("pret");
  }

  async suivreBD(
    id: string,
    f: schémaFonctionSuivi,
    événements: string[] = ["write", "replicated", "ready"]
  ) {
    const bd = await this.ouvrirBD(id);
    for (const é of événements) {
      bd.events.on(é, () => f(bd));
    }
    f(bd);
    const oublier = () => {
      événements.forEach(é => {
        bd.events.off(é, () => f(bd));
      });
    };
    return oublier;
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

  async obtIdBd(nom: string, idRacine: string) {
    const bdRacine = await this.ouvrirBD(idRacine);
    return await bdRacine.get(nom);
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

  async créerBD(nom: string, racine: any, type: string): Promise<string> {
    if (typeof racine === "string") {
      racine = await this.ouvrirBD(racine);
    }
    let idBd = await racine.get(nom);
    if (!idBd) {
      const bd = await this.orbite[type](uuidv4());
      idBd = bd.id;
      await racine.set(nom, idBd);
    }
    return idBd;
  }

  static async créer() {
    const client = new ClientConstellation();
    await client.initialiser();
    return client;
  }
}
