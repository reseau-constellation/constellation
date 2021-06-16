import ensureAddress from "orbit-db-access-controllers/src/utils/ensure-ac-address";
import OrbitDB, { FeedStore, isValidAddress } from "orbit-db";
import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

import { MODÉRATEUR, MEMBRE, rôles } from "./consts";

const type = "controlleur-constellation";

interface OptionsContrôleurConstellation {
  premierMod?: string
  adresseBd?: string
}

interface OptionsInitContrôleurConstellation extends OptionsContrôleurConstellation {
  premierMod: string
}

type objRôles = {[key in typeof rôles[number]]: string[]}

export default class ContrôleurConstellation extends EventEmitter {
  bd?: FeedStore;
  _orbitdb: OrbitDB;
  _premierMod: string;
  _rôles?: objRôles;
  _adresseBd?: string;

  constructor(
    orbitdb: OrbitDB,
    options: OptionsInitContrôleurConstellation
  ) {
    super();
    this._orbitdb = orbitdb;
    this._premierMod = options.premierMod;
    this._adresseBd = options.adresseBd
  }

  static get type() {
    return type;
  }

  // return address of AC (in this case orbitdb address of AC)
  get address() {
    return this.bd!.address;
  }

  async canAppend(entry, identityProvider) {
    const vraiSiSigValide = async () =>
      await identityProvider.verifyIdentity(entry.identity);

    const mods = this.rôles[MODÉRATEUR];
    const membres = this.rôles[MEMBRE];
    const estUnMod = mods.includes(entry.identity.id);
    const estUnMembre = membres.includes(entry.identity.id);

    if (estUnMod || estUnMembre) {
      return await vraiSiSigValide()
    }

    return false;
  }

  get rôles(): objRôles {
    if (!this._rôles) this._updateCapabilites();
    return this._rôles!;
  }

  _updateCapabilites(): void {
    const modérateurs: string[] = [this._premierMod]
    const membres: string[] = [];
    if (this.bd) {
      Object.entries(this.bd.index).forEach((entry) => {
        const capability = entry[1].payload.value.capability;
        const id = entry[1].payload.value.id;
        if (capability === MODÉRATEUR) {
          if (!modérateurs.includes(id)) modérateurs.push(id);
        }
        if (capability === MEMBRE) membres.push(id);
      });
    }
    this._rôles = { MODÉRATEUR: modérateurs, MEMBRE: membres };
  }

  get(rôle: typeof rôles[number]): string[] {
    return this.rôles[rôle] || [];
  }

  async close() {
    await this.bd!.close();
  }

  async load(address: string) {
    const addresseValide = isValidAddress(address);
    if (this.bd) {
      await this.bd.close();
    }

    // TODO - skip manifest for mod-access
    console.log("ici", ensureAddress(address))
    this.bd = await this._orbitdb.feed(
      ensureAddress(address),
      this._createOrbitOpts(addresseValide)
    );

    this.bd.events.on("ready", this._onUpdate.bind(this));
    this.bd.events.on("write", this._onUpdate.bind(this));
    this.bd.events.on("replicated", this._onUpdate.bind(this));

    await this.bd.load();
  }

  _createOrbitOpts(loadByAddress = false) {
    const contrôleurAccès = {
      type: "controlleur-accès-constellation",
      premierMod: this._premierMod,
    };

    return loadByAddress ? {} : { accessController: contrôleurAccès };
  }

  async save() {
    const adresse = this._adresseBd || await this._orbitdb.determineAddress(
      `${uuidv4()}/_access`,
      "feed",
      this._createOrbitOpts()
    );

    const manifest = {
      address: adresse.toString(),
      premierMod: this._premierMod,
    };
    return manifest;
  }

  async grant(rôle: typeof rôles[number], id: string) {
    if (!rôles.includes(rôle)) {
      throw new Error(`Erreur: Le rôle ${rôle} n'existe pas.`);
    }
    if (this.rôles[rôle].includes(id)) {
      return
    }
    try {
      const entry = { rôle, id };
      await this.bd!.add(entry);
    } catch (e) {
      if (e.toString().includes("not append entry"))
        throw new Error(
          `Erreur : Le rôle ${rôle} ne peut pas être octroyé à ${id}`
        );
      throw e;
    }
  }

  _onUpdate() {
    this._updateCapabilites();
    this.emit("updated");
  }

  /* Factory */
  static async create(orbitdb: OrbitDB, options: OptionsContrôleurConstellation = {}) {
    if (!options.premierMod)
      options.premierMod = orbitdb.identity.id
    return new ContrôleurConstellation(
      orbitdb,
      options as OptionsInitContrôleurConstellation
    );
  }
}
