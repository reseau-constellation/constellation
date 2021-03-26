import { AccessControllers } from "orbit-db";
import { EventEmitter } from "events";
const pMapSeries = require("p-map-series");

const மதிப்பீட்டாளர் = "மதிப்பீட்டாளர்";
const உறுப்பினர் = "உறுப்பினர்";

window.AccessControllers = AccessControllers;
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

const path = require("path");
// Make sure the given address has '/_access' as the last part
const ensureAddress = address => {
  const suffix = address
    .toString()
    .split("/")
    .pop();
  return suffix === "_access" ? address : path.join(address, "/_access");
};

class அணுகல்_கட்டுப்படுத்தி extends EventEmitter {
  constructor(orbitdb, options) {
    super();
    console.log("constructor", "அணுகல்_கட்டுப்படுத்தி", options);
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
  async canAppend(entry, identityProvider) {
    // Write keys and admins keys are allowed
    const access = new Set([
      ...this.get(மதிப்பீட்டாளர்),
      ...this.get(உறுப்பினர்)
    ]);
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

      const toSet = e => {
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
          மதிப்பீட்டாளர்: new Set([
            ...(capabilities.மதிப்பீட்டாளர் || []),
            ...this._db.access._முதல்மதிப்பீட்டாளர்
          ])
        }
      }).forEach(toSet);

      return capabilities;
    }
    return {};
  }

  get(capability) {
    return this.capabilities[capability] || new Set([]);
  }

  async close() {
    await this._db.close();
  }

  async load(address) {
    if (this._db) {
      await this._db.close();
    }

    // Force '<address>/_access' naming for the database
    this._db = await this._orbitdb.keyvalue(ensureAddress(address), {
      accessController: {
        type: "controlleur-mod-constellation",
        முதல்மதிப்பீட்டாளர்: this._options.admin || [this._orbitdb.identity.id],
        உறுப்பினர்கள்: true
      },
      sync: true
    });

    this._db.events.on("ready", this._onUpdate.bind(this));
    this._db.events.on("write", this._onUpdate.bind(this));
    this._db.events.on("replicated", this._onUpdate.bind(this));

    await this._db.load();
  }

  async save() {
    // return the manifest data
    return {
      address: this._db.address.toString()
    };
  }

  async grant(capability, key) {
    // Merge current keys with the new key
    const capabilities = new Set([
      ...(this._db.get(capability) || []),
      ...[key]
    ]);
    await this._db.put(capability, Array.from(capabilities.values()));
  }

  async revoke(capability, key) {
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
  static async create(orbitdb, options = {}) {
    console.log("create", this.type, { options });
    const ac = new அணுகல்_கட்டுப்படுத்தி(orbitdb, options);
    await ac.load(
      options.address || options.name || "default-access-controller"
    );

    // Add write access from options
    if (options.முதல்மதிப்பீட்டாளர் && !options.address) {
      await pMapSeries(options.முதல்மதிப்பீட்டாளர், async e =>
        ac.grant("மதிப்பீட்டாளர்", e)
      );
    }

    return ac;
  }
}

class மதிப்பீட்டாளர்_கட்டுப்படுத்தி {
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

  constructor(முதல்மதிப்பீட்டாளர், options) {
    this._capabilityTypes = [மதிப்பீட்டாளர்];
    this._write = []; // Allowed to add other mods or members
    this._முதல்மதிப்பீட்டாளர் = முதல்மதிப்பீட்டாளர்;
    this._write.push(this._முதல்மதிப்பீட்டாளர்);
    this._உறுப்பினர்கள் = Boolean(options.உறுப்பினர்கள்);
    if (this._உறுப்பினர்கள்) this._capabilityTypes.push(உறுப்பினர்);
    this._encKeyId = options.encKeyId;
  }

  static get type() {
    return "controlleur-mod-constellation";
  }

  isMod(id) {
    return this._write.includes(id);
  }

  isValidCapability(capability) {
    return this._capabilityTypes.includes(capability);
  }

  get முதல்மதிப்பீட்டாளர்() {
    return this._முதல்மதிப்பீட்டாளர்;
  }

  async canAppend(entry, identityProvider) {
    const entryID = entry.identity.id;
    const capability = entry.payload.key;
    const idAdd = entry.payload.value;
    const isMod = this.isMod(entryID);
    const validCapability = this.isValidCapability(capability);
    const validSig = async () =>
      identityProvider.verifyIdentity(entry.identity);
    console.log({
      entry,
      entryID,
      capability,
      idAdd,
      isMod,
      validCapability,
      validSig: await validSig()
    });
    if (isMod && validCapability && (await validSig())) {
      if (capability === மதிப்பீட்டாளர்) {
        this._write = idAdd;
      }
      return true;
    }

    return false;
  }

  async load(address) {
    const addList = address.split("/");
    const suffix = addList.pop();
    this._உறுப்பினர்கள் = suffix === "members";
    const mod = suffix.includes("mod") ? suffix : addList.pop();
    this._முதல்மதிப்பீட்டாளர் = mod.split("_")[1];
  }

  async save() {
    // TODO if entire obj saved in manfest, can just pass our own fields
    let address = `${this.type}/mod_${this._முதல்மதிப்பீட்டாளர்}`;
    address += this._உறுப்பினர்கள் ? "/members" : "";
    const manifest = { address };
    if (this._encKeyId) manifest.encKeyId = this._encKeyId;
    return manifest;
  }

  static async create(orbitdb, options = {}) {
    console.log("create", { options }, this.type);
    let முதல்மதிப்பீட்டாளர், உறுப்பினர்கள், encKeyId;

    if (options.address) {
      உறுப்பினர்கள் = options.address.includes("members");
      முதல்மதிப்பீட்டாளர் = options.address.split("/")[1].split("_")[1];
      encKeyId = options.encKeyId;
    } else {
      உறுப்பினர்கள் = options.உறுப்பினர்கள்;
      முதல்மதிப்பீட்டாளர் = options.முதல்மதிப்பீட்டாளர்;
      encKeyId = options.encKeyId;
    }

    if (!முதல்மதிப்பீட்டாளர்)
      throw new Error(
        "மதிப்பீட்டாளர் அணுகல் கட்டுப்படுத்தி: முதல் மதிப்பீட்டாளர் தேவையானது"
      );
    return new மதிப்பீட்டாளர்_கட்டுப்படுத்தி(முதல்மதிப்பீட்டாளர், {
      உறுப்பினர்கள்,
      encKeyId
    });
  }
}

AccessControllers.addAccessController({
  AccessController: அணுகல்_கட்டுப்படுத்தி
});
AccessControllers.addAccessController({
  AccessController: மதிப்பீட்டாளர்_கட்டுப்படுத்தி
});

export default AccessControllers;
