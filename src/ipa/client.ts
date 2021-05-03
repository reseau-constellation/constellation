import { EventEmitter } from "events";
import toBuffer from "it-to-buffer";
import all from "it-all";
import { v4 as uuidv4 } from "uuid";

import initOrbite from "./orbitdb";
import initSFIP from "./ipfs";
import Compte from "./compte";
import BDs from "./bds";
import Tableaux from "./tableaux";
import Variables from "./variables";
import Réseau from "./réseau";
import Favoris from "./favoris";

import Nuée from "./nuée";

type FileContent =
  | string
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | Iterable<ArrayBuffer | ArrayBufferView>
  | AsyncIterable<ArrayBuffer | ArrayBufferView>;

export type schémaFonctionSuivi = (x: any) => void;
export type schémaFonctionOublier = () => void;

export default class ClientConstellation extends EventEmitter {
  _dir: string;
  _opsAutoBD: { [key: string]: any } = {};
  _bdRacine: any;
  _bds: { [key: string]: any };
  orbite: any;
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

    const idBdVariables = await this.obtIdBd(
      "variables",
      this._bdRacine,
      "feed"
    );
    this.variables = new Variables(this, idBdVariables);

    const idBdRéseau = await this.obtIdBd("réseau", this._bdRacine, "feed");
    this.réseau = new Réseau(this, idBdRéseau);

    const idBdFavoris = await this.obtIdBd("favoris", this._bdRacine, "feed");
    this.favoris = new Favoris(this, idBdFavoris);

    this.nuée = new Nuée(this);

    this.pret = true;
    this.emit("pret");
  }

  async connecterPoste(id: string, racine: string): Promise<void> {
    const protocol = "/p2p-circuit/ipfs/";
    let postes = await this.sfip.swarm.peers();
    try {
      await this.sfip.swarm.connect(protocol + id);
      postes = await this.sfip.swarm.peers();
      console.log("connecté", { postes });
    } catch (e) {
      console.error(e);
    }
  }

  async suivreConnexionsPostes(
    f: schémaFonctionSuivi,
    t = 3000
  ): Promise<schémaFonctionOublier> {
    const fFinale = async () => {
      const connexions = await this.sfip.swarm.peers();
      f(connexions);
    };
    const oublier = setInterval(fFinale, t);
    fFinale();
    return () => clearInterval(oublier);
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
    f: schémaFonctionSuivi,
    renvoyerValeur = true
  ): Promise<schémaFonctionOublier> {
    return await this.suivreBD(id, async bd => {
      const éléments = bd
        .iterator({ limit: -1 })
        .collect()
        .map((e: { [key: string]: any }) => renvoyerValeur ? e.payload.value : e);
      f(éléments);
    });
  }

  async suivreBdsEmboîtées(
    fRacine: (f: schémaFonctionSuivi) => Promise<schémaFonctionOublier>,
    fBranche: (n: any, fSuivreBranche: schémaFonctionSuivi) => Promise<schémaFonctionOublier>,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    interface InterfaceBranches {
      bds: string[];
      fOublier?: schémaFonctionOublier;
    }
    const bds: { [key: string]: InterfaceBranches } = {};
    const fFinale = () => {
      const listeBds = Object.values(bds)
        .map(x => x.bds)
        .flat();
      f(listeBds);
    };

    const code = x => typeof x === "string" ? x : JSON.stringify(x)

    const fSuivreRacine = async (branches: string[]) => {
      const existants = Object.keys(bds);
      const nouveaux = branches.filter(m => !existants.includes(m));
      const disparus = existants.filter(m => !branches.includes(m));
      for (const d of disparus) {
        const fOublier = bds[code(d)].fOublier;
        if (fOublier) fOublier();
        delete bds[code(d)];
      }
      nouveaux.map(async (n: string) => {
        bds[code(n)] = {
          bds: []
        };
        const fSuivreBranche = (bdsBranche: string[]) => {
          bds[code(n)].bds = bdsBranche;
          fFinale();
        };
        const fOublier = await fBranche(n, fSuivreBranche);
        bds[code(n)].fOublier = fOublier;
      });
    };
    const oublierRacine = await fRacine(fSuivreRacine);

    const oublier = () => {
      oublierRacine();
      Object.values(bds).map(x => (x.fOublier ? x.fOublier() : null));
    };
    return oublier;
  }

  async rechercherBdListe(id: string, f: schémaFonctionSuivi): Promise<any> {
    const bd = await this.ouvrirBD(id);
    const élément = bd
      .iterator({ limit: -1 })
      .collect()
      .find((e: { [key: string]: any }) => f(e));
    return élément;
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
    await bd.load();
    this._bds[id] = bd;
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

    const permission = await this.permissionÉcrire(racine.id);
    if (!idBd && permission && type) {
      bd = await this.orbite[type](uuidv4());
      await bd.load();
      idBd = bd.id;
      await racine.set(nom, idBd);
    }
    return idBd;
  }

  async créerBDIndépendante(type: string): Promise<string> {
    const bd = await this.orbite[type](uuidv4());
    await bd.load();
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
