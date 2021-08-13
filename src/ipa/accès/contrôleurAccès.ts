import { EventEmitter } from "events";
import OrbitDB, { entréeBD, identityProvider } from "orbit-db";
import { MODÉRATEUR, rôles } from "./consts";
import { entréeBDAccès } from "./contrôleurConstellation";

const type = "controlleur-accès-constellation";

export interface OptionsContrôleurAccèsConstellation {
  premierMod?: string;
}

interface OptionsInitContrôleurAccèsConstellation
  extends OptionsContrôleurAccèsConstellation {
  premierMod: string;
}

export default class ContrôleurAccès extends EventEmitter {
  _accèsÉcriture: string[];
  _premierMod: string;
  orbitdb: OrbitDB;

  constructor(
    orbitdb: OrbitDB,
    options: OptionsInitContrôleurAccèsConstellation
  ) {
    super();
    this.orbitdb = orbitdb;
    this._accèsÉcriture = [options.premierMod]; // Peut ajouter d'autres membres ou modératrices
    this._premierMod = options.premierMod;
  }

  static get type(): string {
    return type;
  }

  estUnModérateur(id: string): boolean {
    return this._accèsÉcriture.includes(id);
  }

  async estUnModérateurPatient(id: string): Promise<boolean> {
    if (this.estUnModérateur(id)) return true;
    const dormir = (milliseconds: number) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };
    await dormir(5000);
    return this.estUnModérateur(id);
  }

  get premierMod(): string {
    return this._premierMod;
  }

  async canAppend(
    entry: entréeBD<entréeBDAccès>,
    identityProvider: identityProvider
  ): Promise<boolean> {
    const idÉlément = entry.identity.id;
    const { rôle, id: idAjout } = entry.payload.value;
    const estUnMod = this.estUnModérateurPatient(idÉlément);
    const rôleValide = rôles.includes(rôle);

    console.log({
      estUnMod,
      rôleValide,
      rôle,
      idÉlément,
      idAjout,
      accèsÉcriture: [...this._accèsÉcriture],
      entry,
    });
    const validSig = async () =>
      identityProvider.verifyIdentity(entry.identity);

    if (rôleValide && (await estUnMod) && (await validSig())) {
      if (rôle === MODÉRATEUR) {
        if (idAjout === this._premierMod) return true;
        if (!this._accèsÉcriture.includes(idAjout))
          this._accèsÉcriture.push(idAjout);
      }
      return true;
    }
    return false;
  }

  async load(): Promise<void> {
    // Rien à faire je crois
  }

  async save(): Promise<{ [key: string]: string }> {
    const manifest = { premierMod: this.premierMod };
    return manifest;
  }

  static async create(
    orbitdb: OrbitDB,
    options: OptionsContrôleurAccèsConstellation = {}
  ): Promise<ContrôleurAccès> {
    const premierMod = options.premierMod;
    if (!premierMod)
      throw new Error("Contrôle d'accès: premier modérateur requis");
    return new ContrôleurAccès(orbitdb, { premierMod });
  }
}
