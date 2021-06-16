import { EventEmitter } from "events";
import { MODÉRATEUR, MEMBRE, rôles } from "./consts";
import OrbitDB from "orbit-db";


const type = "controlleur-accès-constellation";

export default class ContrôleurAccès extends EventEmitter  {
  _accèsÉcriture: string[]
  _premierMod: string

  constructor(options) {
    super();
    this._accèsÉcriture = [options.premierMod]     // Allowed to add other mods or members
    this._premierMod = options.premierMod
  }

  static get type() {
    return type;
  }

  estUnModérateur(id: string) {
    return this._accèsÉcriture.includes(id)
  }

  get firstModerator () {
    return this._firstModerator
  }

  async canAppend (entry, identityProvider) {
    const idÉlément = entry.identity.id
    const { rôle, id: idAjout } = entry.payload.value
    const isMod = this.estUnModérateur(idÉlément)
    const validCapability = rôles.includes(rôle)
    const validSig = async () => identityProvider.verifyIdentity(entry.identity)
    if (isMod && validCapability && (await validSig())) {
      if (rôle === MODÉRATEUR) {
        if (idAjout === this._premierMod) return true
        this._accèsÉcriture.push(idAjout)
      }
      return true
    }

    return false
  }

  async load (address) {
    // Rien à faire je crois
  }

  async save () {
    const manifest =  { premierMod: this._premierMod }
    return manifest
  }

  static async create (orbitdb: OrbitDB, options = {}) {
    const premierMod = options.premierMod

    if (!premierMod) throw new Error("Contrôle d'accès: premier modérateur requis")
    return new ContrôleurAccès({ premierMod })
  }
}
