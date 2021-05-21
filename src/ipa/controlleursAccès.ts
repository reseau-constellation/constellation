import OrbitDB from "orbit-db";
import { AccessControllers } from "orbit-db";
import { EventEmitter } from "events";
import path from "path";
import pMapSeries from "p-map-series";

const MODÉRATEUR = "MODÉRATEUR";
const MEMBRE = "MEMBRE";

/*
MIT License

Copyright (c) 2018 Haja Networks Oy

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

// Make sure the given address has '/_access' as the last part
const ensureAddress = (address: string) => {
  const suffix = address.toString().split("/").pop();
  return suffix === "_access" ? address : path.join(address, "/_access");
};

interface OptionsControlleurConstellation {
  membres?: boolean;
  premierMod?: string;
  address?: string;
  name?: string;
  admin?: string;
}

class ControlleurConstellation extends EventEmitter {
  _db: any;
  _orbitdb: any;
  _options: OptionsControlleurConstellation;

  constructor(orbitdb: any, options: OptionsControlleurConstellation) {
    super();
    this._orbitdb = orbitdb;
    this._db = null;
    this._options = options || {};
  }

  // Returns the type of the access controller
  static get type() {
    return "controlleur-constellation";
  }

  // Returns the address of the OrbitDB used as the AC
  get address() {
    return this._db.address;
  }

  // Return true if entry is allowed to be added to the database
  async canAppend(entry: any, identityProvider: any) {
    // Write keys and admins keys are allowed
    const access = new Set([...this.get(MODÉRATEUR), ...this.get(MEMBRE)]);
    // If the ACL contains the writer's public key or it contains '*'
    if (access.has(entry.identity.id) || access.has("*")) {
      const verifiedIdentity = await identityProvider.verifyIdentity(
        entry.identity
      );
      // Allow access if identity verifies
      return verifiedIdentity;
    }

    return false;
  }

  get capabilities() {
    if (this._db) {
      const capabilities = this._db.index;

      const toSet = (e: [string, any]) => {
        const key = e[0];
        capabilities[key] = new Set([...(capabilities[key] || []), ...e[1]]);
      };

      // Merge with the access controller of the database
      // and make sure all values are Sets
      Object.entries({
        ...capabilities,
        // Add the root access controller's 'write' access list
        // as admins on this controller
        ...{
          MODÉRATEUR: new Set([
            ...(capabilities.MODÉRATEUR || []),
            ...this._db.access._premierMod,
          ]),
        },
      }).forEach(toSet);

      return capabilities;
    }
    return {};
  }

  get(capability: string) {
    return this.capabilities[capability] || new Set([]);
  }

  async close() {
    await this._db.close();
  }

  async load(address: string) {
    if (this._db) {
      await this._db.close();
    }

    // Force '<address>/_access' naming for the database
    this._db = await this._orbitdb.keyvalue(ensureAddress(address), {
      accessController: {
        type: "controlleur-mod-constellation",
        premierMod: this._options.admin || [this._orbitdb.identity.id],
        membres: true,
      },
      sync: true,
    });

    this._db.events.on("ready", this._onUpdate.bind(this));
    this._db.events.on("write", this._onUpdate.bind(this));
    this._db.events.on("replicated", this._onUpdate.bind(this));

    await this._db.load();
  }

  async save() {
    // return the manifest data
    return {
      address: this._db.address.toString(),
    };
  }

  async grant(capability: string, key: string) {
    // Merge current keys with the new key
    const capabilities = new Set([
      ...(this._db.get(capability) || []),
      ...[key],
    ]);
    await this._db.put(capability, Array.from(capabilities.values()));
  }

  async revoke(capability: string, key: string) {
    const capabilities = new Set(this._db.get(capability) || []);
    capabilities.delete(key);
    if (capabilities.size > 0) {
      await this._db.put(capability, Array.from(capabilities.values()));
    } else {
      await this._db.del(capability);
    }
  }

  /* Private methods */
  _onUpdate() {
    this.emit("updated");
  }

  /* Factory */
  static async create(
    orbitdb: any,
    options: OptionsControlleurConstellation = {}
  ) {
    const ac = new ControlleurConstellation(orbitdb, options);
    await ac.load(
      options.address || options.name || "default-access-controller"
    );

    // Add write access from options
    if (options.premierMod && !options.address) {
      await pMapSeries(options.premierMod, async (e: string) =>
        ac.grant(MODÉRATEUR, e)
      );
    }

    return ac;
  }
}

interface OptionsControlleurModConstellation {
  membres?: boolean;
  premierMod?: string;
  address?: string;
}

class ControlleurModConstellation {
  /*
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
  _membres: boolean;
  _premierMod: string;
  _write: string[];
  _capabilityTypes: string[];

  constructor(premierMod: string, options: OptionsControlleurModConstellation) {
    this._capabilityTypes = [MODÉRATEUR];
    this._write = []; // Allowed to add other mods or members
    this._premierMod = premierMod;
    this._write.push(this._premierMod);
    this._membres = Boolean(options.membres);
    if (this._membres) this._capabilityTypes.push(MEMBRE);
  }

  static get type(): string {
    return "controlleur-mod-constellation";
  }

  isMod(id: string) {
    return this._write.includes(id);
  }

  isValidCapability(capability: string) {
    return this._capabilityTypes.includes(capability);
  }

  get முதல்மதிப்பீட்டாளர்() {
    return this._premierMod;
  }

  async canAppend(entry: any, identityProvider: any) {
    const entryID = entry.identity.id;
    const capability = entry.payload.key;
    const idAdd = entry.payload.value;
    const isMod = this.isMod(entryID);
    const validCapability = this.isValidCapability(capability);
    const validSig = async () =>
      identityProvider.verifyIdentity(entry.identity);

    if (isMod && validCapability && (await validSig())) {
      if (capability === MODÉRATEUR) {
        this._write = idAdd;
      }
      return true;
    }

    return false;
  }

  async load(address: string) {
    const addList = address.split("/");
    const suffix = addList.pop();
    this._membres = suffix === "members";
    const mod = suffix && suffix.includes("mod") ? suffix : addList.pop();
    if (mod) {
      this._premierMod = mod.split("_")[1];
    } else {
      throw "Premier mod nécessaire";
    }
  }

  async save() {
    // TODO if entire obj saved in manfest, can just pass our own fields
    let address = `${ControlleurModConstellation.type}/mod_${this._premierMod}`;
    address += this._membres ? "/members" : "";
    const manifest = { address };
    return manifest;
  }

  static async create(
    orbitdb: OrbitDB,
    options: OptionsControlleurModConstellation = {}
  ) {
    let premierMod, membres;

    if (options.address) {
      membres = options.address.includes("members");
      premierMod = options.address.split("/")[1].split("_")[1];
    } else {
      membres = options.membres;
      premierMod = options.premierMod;
    }

    if (!premierMod) throw new Error("Premier mod nécessaire");
    return new ControlleurModConstellation(premierMod, {
      membres,
    });
  }
}

AccessControllers.addAccessController({
  AccessController: ControlleurConstellation,
});
AccessControllers.addAccessController({
  AccessController: ControlleurModConstellation,
});

export default AccessControllers;
