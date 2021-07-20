import ensureAddress from "orbit-db-access-controllers/src/utils/ensure-ac-address";
import OrbitDB, {
  FeedStore,
  isValidAddress,
  entréeBD,
  identityProvider,
} from "orbit-db";
import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

import { MODÉRATEUR, MEMBRE, rôles } from "./consts";

/* Fortement inspirée du contrôleur Orbit-DB de 3Box
MIT License

Copyright (c) 2019 3Box Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

export const nomType = "controlleur-constellation";

export interface OptionsContrôleurConstellation {
  premierMod?: string;
  adresseBd?: string;
  nom?: string;
}

export type entréeBDAccès = {
  rôle: typeof rôles[number];
  id: string;
};

interface OptionsInitContrôleurConstellation
  extends OptionsContrôleurConstellation {
  premierMod: string;
  nom: string;
}

export type objRôles = { [key in typeof rôles[number]]: string[] };

export default class ContrôleurConstellation extends EventEmitter {
  bd?: FeedStore;
  nom: string;
  _orbitdb: OrbitDB;
  _premierMod: string;
  _rôles?: objRôles;
  adresseBd?: string;
  type: string;

  constructor(orbitdb: OrbitDB, options: OptionsInitContrôleurConstellation) {
    super();
    this._orbitdb = orbitdb;
    this._premierMod = options.premierMod;
    this.adresseBd = options.adresseBd;
    this.nom = options.nom;
    this.type = nomType;
  }

  static get type() {
    return nomType;
  }

  // return address of AC (in this case orbitdb address of AC)
  get address() {
    return this.bd!.address;
  }

  estAutorisé(id: string): boolean {
    const mods = this.rôles[MODÉRATEUR];
    const membres = this.rôles[MEMBRE];
    const estUnMod = mods.includes(id);
    const estUnMembre = membres.includes(id);
    return estUnMod || estUnMembre;
  }

  async canAppend(
    entry: entréeBD<entréeBDAccès>,
    identityProvider: identityProvider
  ) {
    const vraiSiSigValide = async () =>
      await identityProvider.verifyIdentity(entry.identity);

    const mods = this.rôles[MODÉRATEUR];
    const membres = this.rôles[MEMBRE];
    const estUnMod = mods.includes(entry.identity.id);
    const estUnMembre = membres.includes(entry.identity.id);

    if (estUnMod || estUnMembre) {
      return await vraiSiSigValide();
    }

    return false;
  }

  get rôles(): objRôles {
    if (!this._rôles) this._updateCapabilites();
    return this._rôles!;
  }

  _updateCapabilites(): void {
    const modérateurs: string[] = [this._premierMod];
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
    console.log("ici", ensureAddress(address));
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
    const adresse =
      this.adresseBd ||
      (await this._orbitdb.determineAddress(
        `${this.nom}/_access`,
        "feed",
        this._createOrbitOpts()
      ));

    const manifest = {
      address: adresse.toString(),
      premierMod: this._premierMod,
      nom: this.nom,
    };
    console.log({ manifest });
    return manifest;
  }

  async grant(rôle: typeof rôles[number], id: string) {
    if (!rôles.includes(rôle)) {
      throw new Error(`Erreur: Le rôle ${rôle} n'existe pas.`);
    }
    if (this.rôles[rôle].includes(id)) {
      return;
    }
    try {
      const entry = { rôle, id };
      await this.bd!.add(entry);
    } catch (e) {
      if (e.toString().includes("not append entry"))
        throw new Error(
          `Erreur : Le rôle ${rôle} ne peut pas être octroyé à ${id}.`
        );
      throw e;
    }
  }

  async revoke(rôle: typeof rôles[number], id: string) {
    const élément = this.bd!.iterator({ limit: -1 })
      .collect()
      .find(
        (e: { [key: string]: any }) =>
          e.payload.value.rôle === rôle && e.payload.value.id === id
      );
    if (!élément)
      throw new Error(`Erreur : Le rôle ${rôle} n'existait pas pour ${id}.`);
    const empreint = élément.hash;
    await this.bd!.remove(empreint);
  }

  _onUpdate() {
    this._updateCapabilites();
    this.emit("updated");
  }

  /* Factory */
  static async create(
    orbitdb: OrbitDB,
    options: OptionsContrôleurConstellation
  ) {
    if (!options.premierMod) options.premierMod = orbitdb.identity.id;
    options.nom = options.nom || uuidv4();
    return new ContrôleurConstellation(
      orbitdb,
      options as OptionsInitContrôleurConstellation
    );
  }
}
