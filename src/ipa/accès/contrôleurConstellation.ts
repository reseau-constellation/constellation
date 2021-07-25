import ensureAddress from "orbit-db-access-controllers/src/utils/ensure-ac-address";
import OrbitDB, {
  FeedStore,
  isValidAddress,
  entréeBD,
  identityProvider,
} from "orbit-db";
import AccessController from "orbit-db-access-controllers/src/access-controller-interface";
import { EventEmitter, once } from "events";
import { v4 as uuidv4 } from "uuid";

import {
  schémaFonctionSuivi,
  schémaFonctionOublier,
  élémentBdListe,
} from "../client";
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

const événementsSuiviBd = ["ready", "write", "replicate", "replicated"];

const suivreBdAccès = async (
  bd: FeedStore,
  f: schémaFonctionSuivi<entréeBDAccès[]>
): Promise<schémaFonctionOublier> => {
  const fFinale = () => {
    const éléments: entréeBDAccès[] = bd
      .iterator({ limit: -1 })
      .collect()
      .map((e: élémentBdListe<entréeBDAccès>) => e.payload.value);
    f(éléments);
  };
  for (const é of événementsSuiviBd) {
    bd.events.on(é, fFinale);
  }
  fFinale();
  const oublier = () => {
    événementsSuiviBd.forEach((é) => {
      bd.events.off(é, fFinale);
    });
  };
  return oublier;
};

class AccèsUtilisateur extends EventEmitter {
  orbite: OrbitDB;
  bd?: FeedStore;
  bdAccès?: FeedStore;
  oublierSuivi?: schémaFonctionOublier;
  autorisés: string[];
  accès?: ContrôleurConstellation;

  constructor(orbite: OrbitDB) {
    super();
    this.orbite = orbite;
    this.autorisés = [];
  }

  async initialiser(idBd: string): Promise<void> {
    this.bd = (await this.orbite.open(idBd)) as FeedStore;
    await this.bd.load();
    this.accès = this.bd.access as unknown as ContrôleurConstellation
    this.bdAccès = this.accès.bd!;

    this.oublierSuivi = await suivreBdAccès(
      this.bdAccès,
      async (éléments: entréeBDAccès[]) => {
        await this._miseÀJour(éléments);
      }
    );
  }

  async _miseÀJour(éléments: entréeBDAccès[]) {
    const autorisés: string[] = [];
    éléments = [{
      id: this.accès!._premierMod,
      rôle: MODÉRATEUR
    }, ...éléments]
    éléments.forEach((é) => {
      autorisés.push(é.id);
    });
    this.autorisés = autorisés;
  }

  async fermer() {
    this.oublierSuivi!();
    await this.bd!.close();
  }
}

export default class ContrôleurConstellation extends AccessController {
  bd?: FeedStore;
  nom: string;
  _orbitdb: OrbitDB;
  _premierMod: string;
  _rôles: objRôles;
  adresseBd?: string;
  _rôlesIdOrbite: objRôles;
  _rôlesUtilisateurs: {
    [key in typeof rôles[number]]: {
      [key: string]: AccèsUtilisateur;
    };
  };
  _miseÀJourEnCours: boolean;

  constructor(orbitdb: OrbitDB, options: OptionsInitContrôleurConstellation) {
    super();
    this._orbitdb = orbitdb;
    this._premierMod = options.premierMod;
    this.adresseBd = options.adresseBd;
    this.nom = options.nom;
    this._rôles = { MODÉRATEUR: [], MEMBRE: [] };
    this._rôlesIdOrbite = { MODÉRATEUR: [], MEMBRE: [] };
    this._rôlesUtilisateurs = { MODÉRATEUR: {}, MEMBRE: {} };
    this._miseÀJourEnCours = false
  }

  static get type() {
    return nomType;
  }

  // return address of AC (in this case orbitdb address of AC)
  get address() {
    return this.bd!.address;
  }

  estUnMembre(id: string): boolean {
    return this._rôles[MEMBRE].includes(id);
  }

  estUnModérateur(id: string): boolean {
    return this._rôles[MODÉRATEUR].includes(id);
  }

  async estAutorisé(id: string): Promise<boolean> {
    if (this._miseÀJourEnCours) await once(this, "misÀJour")
    return this.estUnModérateur(id) || this.estUnMembre(id);
  }

  async canAppend(
    entry: entréeBD<entréeBDAccès>,
    identityProvider: identityProvider
  ) {
    const vraiSiSigValide = async () =>
      await identityProvider.verifyIdentity(entry.identity);

    if (await this.estAutorisé(entry.identity.id)) {
      return await vraiSiSigValide();
    }

    return false;
  }

  get rôles(): objRôles {
    if (!this._rôles) this._updateCapabilites();
    return this._rôles!;
  }

  async _miseÀJourBdAccès(éléments: entréeBDAccès[]): Promise<void> {
    this._miseÀJourEnCours = true
    éléments = [{ rôle: MODÉRATEUR, id: this._premierMod }, ...éléments];

    await Promise.all(éléments.map(async (élément) => {
      const { rôle, id } = élément;

      if (isValidAddress(id)) {
        if (!this._rôlesUtilisateurs[rôle][id]) {
          const objAccèsUtilisateur = new AccèsUtilisateur(this._orbitdb);
          objAccèsUtilisateur.on("misÀJour", () => this._mettreRôlesÀJour());
          await objAccèsUtilisateur.initialiser(id)
          this._rôlesUtilisateurs[rôle][id] = objAccèsUtilisateur;
        }
      } else {
        if (!this._rôlesIdOrbite[rôle].includes(id))
          this._rôlesIdOrbite[rôle].push(id);
      }
    }));
    this._miseÀJourEnCours = false
    this._mettreRôlesÀJour();

    // Je ne sais pas si ceci est nécessaire mais je le laisse pour l'instant au cas où
    this.emit("misÀJour");
  }

  _mettreRôlesÀJour(): void {
    const _rôles: objRôles = { MODÉRATEUR: [], MEMBRE: [] };

    for (const [rôle, ids] of Object.entries(this._rôlesIdOrbite)) {
      const listeRôle = _rôles[rôle as keyof objRôles];
      ids.forEach((id) => {
        if (!listeRôle.includes(id)) listeRôle.push(id);
      });
    }

    for (const [rôle, utl] of Object.entries(this._rôlesUtilisateurs)) {
      const listeRôle = _rôles[rôle as keyof objRôles];
      Object.values(utl).forEach((u) => {
        u.autorisés.forEach((id) => {
          if (!listeRôle.includes(id)) listeRôle.push(id);
        });
      });
    }

    this._rôles = _rôles;
  }

  get(rôle: typeof rôles[number]): string[] {
    return this.rôles[rôle] || [];
  }

  async close() {
    await this.bd!.close();
    const utilisateurs = Object.values(this._rôlesUtilisateurs)
      .map((l) => Object.values(l))
      .flat();
    await Promise.all(utilisateurs.map((u) => u.fermer()));
  }

  async load(address: string) {
    const addresseValide = isValidAddress(address);
    if (this.bd) {
      await this.bd.close();
    }

    // TODO - skip manifest for mod-access
    this.bd = await this._orbitdb.feed(
      ensureAddress(address),
      this._createOrbitOpts(addresseValide)
    );
    suivreBdAccès(this.bd, (éléments) => this._miseÀJourBdAccès(éléments));
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
