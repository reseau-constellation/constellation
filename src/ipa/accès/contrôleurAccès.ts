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

  constructor(options: OptionsInitContrôleurAccèsConstellation) {
    super();
    this._accèsÉcriture = [options.premierMod]; // Peut ajouter d'autres membres ou modératrices
    this._premierMod = options.premierMod;
  }

  static get type() {
    return type;
  }

  estUnModérateur(id: string) {
    return this._accèsÉcriture.includes(id);
  }

  get premierMod() {
    return this._premierMod;
  }

  async canAppend(
    entry: entréeBD<entréeBDAccès>,
    identityProvider: identityProvider
  ) {
    const idÉlément = entry.identity.id;
    const { rôle, id: idAjout } = entry.payload.value;
    const isMod = this.estUnModérateur(idÉlément);
    const validCapability = rôles.includes(rôle);
    const validSig = async () =>
      identityProvider.verifyIdentity(entry.identity);
    if (isMod && validCapability && (await validSig())) {
      if (rôle === MODÉRATEUR) {
        if (idAjout === this._premierMod) return true;
        this._accèsÉcriture.push(idAjout);
      }
      return true;
    }

    return false;
  }

  async load() {
    // Rien à faire je crois
  }

  async save() {
    const manifest = { premierMod: this.premierMod };
    return manifest;
  }

  static async create(
    orbitdb: OrbitDB,
    options: OptionsContrôleurAccèsConstellation = {}
  ) {
    const premierMod = options.premierMod;

    if (!premierMod)
      throw new Error("Contrôle d'accès: premier modérateur requis");
    return new ContrôleurAccès({ premierMod });
  }
}
