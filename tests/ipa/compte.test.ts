import log from "why-is-node-running";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { step } from "mocha-steps";
import { v4 as uuidv4 } from "uuid";

import rmrf from "rimraf";
import { connectPeers } from "orbit-db-test-utils";
import fs from "fs";
import path from "path";
import OrbitDB from "orbit-db";
import { Controller } from "ipfsd-ctl/src/types";

chai.should();
chai.use(chaiAsPromised);

const assert = chai.assert;

import { enregistrerContrôleurs } from "@/ipa/accès";
import ClientConstellation, { schémaFonctionOublier } from "@/ipa/client";
import { MAX_TAILLE_IMAGE } from "@/ipa/compte";
import { startIpfs, stopIpfs, testAPIs, config } from "./sfipTest";
import { attendreRésultat } from "./utils";

const LOG = false;

const racineDossierSFIP = "./tests/ipa/temp/"+uuidv4();
const dbPath1 = racineDossierSFIP + "/tests/sfip";
const dbPath2 = racineDossierSFIP + "/tests/sfip2";

Object.keys(testAPIs).forEach((API) => {
  describe("Compte", function () {
    this.timeout(config.timeout);
    let ipfsd1: Controller,
      ipfsd2: Controller,
      ipfs1,
      ipfs2,
      orbitdb1: OrbitDB,
      orbitdb2: OrbitDB;

    let client: ClientConstellation;
    let client2: ClientConstellation;

    before(async () => {
      rmrf.sync(racineDossierSFIP);

      ipfsd1 = await startIpfs(API, config.daemon1);
      ipfsd2 = await startIpfs(API, config.daemon2);
      ipfs1 = ipfsd1.api;
      ipfs2 = ipfsd2.api;

      enregistrerContrôleurs();

      orbitdb1 = await OrbitDB.createInstance(ipfs1, { directory: dbPath1 });
      orbitdb2 = await OrbitDB.createInstance(ipfs2, { directory: dbPath2 });
      await connectPeers(ipfs1, ipfs2);

      client = await ClientConstellation.créer(
        undefined,
        undefined,
        orbitdb1
      );
      client2 = await ClientConstellation.créer(
        undefined,
        undefined,
        orbitdb2
      );
    });
    after(async () => {
      if (client) await client.fermer();
      if (client2) await client2.fermer();
      if (orbitdb1) await orbitdb1.stop();

      if (orbitdb2) await orbitdb2.stop();

      if (ipfsd1) await stopIpfs(ipfsd1);

      if (ipfsd2) await stopIpfs(ipfsd2);

      rmrf.sync(racineDossierSFIP);
    });
    describe("Courriels", function () {
      let courriel: string
      const rés: {ultat: string|undefined} = {ultat: undefined}
      let fOublier: schémaFonctionOublier;
      let fOublier2: schémaFonctionOublier;

      const COURRIEL = "தொடர்பு@லஸ்ஸி.இந்தியா"

      before(async () => {
        fOublier = await client.compte!.suivreCourriel((c)=> courriel = c)
        fOublier2 = await client2.compte!.suivreCourriel((c)=> rés["ultat"] = c, client.compte!.idBd)
      })

      step("Pas de courriel pour commencer", async () => {
        expect(courriel).to.be.undefined;
      });

      step("Ajouter un courriel", async () => {
        await client.compte!.sauvegarderCourriel(COURRIEL)
        expect(courriel).to.equal(COURRIEL);
      })

      step("Lire le courriel d'un autre membre", async () => {
        await attendreRésultat(rés, "ultat")
        expect(rés["ultat"]).to.equal(COURRIEL);
      })

      step("Effacer le courriel", async () => {
        await client.compte!.effacerCourriel()
        expect(courriel).to.be.undefined;
      })

      after(async () => {
        if (fOublier) fOublier();
        if (fOublier2) fOublier2();
      })
    })

    describe("Noms", function () {
      const rés: {ultat: {[key: string]: string}|undefined, ultat2: {[key: string]: string}|undefined} = {ultat: undefined, ultat2: undefined}
      let fOublier: schémaFonctionOublier;
      let fOublier2: schémaFonctionOublier;

      before(async () => {
        fOublier = await client.compte!.suivreNoms((n)=> rés["ultat"] = n)
        fOublier2 = await client2.compte!.suivreNoms((n)=> rés["ultat2"] = n, client.compte!.idBd)
      })

      after(async () => {
        if (fOublier) fOublier();
        if (fOublier2) fOublier2();
      })

      step("Pas de noms pour commencer", async () => {
        await attendreRésultat(rés, "ultat")
        expect(rés.ultat).to.be.empty
      });

      step("Ajouter un nom", async () => {
        await client.compte!.sauvegarderNom("fr", "Julien Malard-Adam")
        expect(rés.ultat?.fr).to.equal("Julien Malard-Adam");

        await client.compte!.sauvegarderNom("த", "ஜூலீஎன்")
        expect(rés.ultat?.த).to.equal("ஜூலீஎன்");
      })

      step("Lire les noms d'un autre membre", async () => {
        await attendreRésultat(rés, "ultat2", (d: {[key: string]: string})=>["த", "fr"].every(c=>Object.keys(d).includes(c)))
        expect(rés.ultat2).to.deep.equal({"த": "ஜூலீஎன்", "fr": "Julien Malard-Adam"});
      })

      step("Changer un nom", async () => {
        await client.compte!.sauvegarderNom("த", "ம.-ஆதான் ஜூலீஎன்")
        expect(rés.ultat?.த).to.equal("ம.-ஆதான் ஜூலீஎன்");
      })

      step("Effacer un nom", async () => {
        await client.compte!.effacerNom("fr")
        expect(rés.ultat).to.deep.equal({"த": "ம.-ஆதான் ஜூலீஎன்"});
      })

    })

    describe("Images", function () {
      const rés: {ultat: Uint8Array|undefined|null, ultat2: Uint8Array|undefined|null} = {ultat: undefined, ultat2: undefined}
      let fOublier: schémaFonctionOublier;
      let fOublier2: schémaFonctionOublier;

      const OCTETS = fs.readFileSync(path.resolve(__dirname, "../../src/assets/logo.svg"))
      const IMAGE: File = {
        name: "logo.png",
        path: "../../assets/logo.png",
        arrayBuffer: () => Promise.resolve(OCTETS),
        lastModified: Date.now(),
        size: 100,
        stream: () => new ReadableStream(),
        type: "image/png",
        text: ()=>Promise.resolve(""),
        slice: ()=>new Blob()
      };

      before(async () => {
        fOublier = await client.compte!.suivreImage((i)=> rés["ultat"] = i)
        fOublier2 = await client2.compte!.suivreImage((i)=> rés["ultat2"] = i, client.compte!.idBd)
      })

      step("Pas d'image pour commencer", async () => {
        expect(rés["ultat"]).to.be.null;
      });

      step("Ajouter une image", async () => {
        await client.compte!.sauvegarderImage(IMAGE);
        await attendreRésultat(rés, "ultat", (v: unknown) => Boolean(v))
        expect(rés["ultat"]).to.deep.equal(new Uint8Array(OCTETS));
      })

      step("Lire l'image d'un autre membre", async () => {
        await attendreRésultat(rés, "ultat2", (v: unknown) => Boolean(v))
        expect(rés["ultat2"]).to.deep.equal(new Uint8Array(OCTETS));
      })

      step("Effacer l'image", async () => {
        await client.compte!.effacerImage()
        expect(rés["ultat"]).to.be.null;
      })

      step("Ajouter une image trop grande", async () => {
        assert.isRejected(client.compte!.sauvegarderImage(
          Object.assign({}, IMAGE, {size: MAX_TAILLE_IMAGE + 1})
        ))
      })

      after(async () => {
        if (fOublier) fOublier();
        if (fOublier2) fOublier2();
      })
    })


  });
});

if (LOG)
  setTimeout(function () {
    log(); // logs out active handles that are keeping node running
  }, 10000);
