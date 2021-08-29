import log from "why-is-node-running";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { step } from "mocha-steps";
import { v4 as uuidv4 } from "uuid";

import rmrf from "rimraf";
import { connectPeers } from "orbit-db-test-utils";

import OrbitDB from "orbit-db";
import { Controller } from "ipfsd-ctl/src/types";

chai.should();
chai.use(chaiAsPromised);

import { enregistrerContrôleurs } from "@/ipa/accès";
import ClientConstellation, { schémaFonctionOublier } from "@/ipa/client";
import { startIpfs, stopIpfs, testAPIs, config } from "./sfipTest";
import { attendreRésultat } from "./utils";

const LOG = false;

const racineDossierSFIP = "./tests/ipa/temp/"+uuidv4();
const dbPath1 = racineDossierSFIP + "/tests/sfip";
const dbPath2 = racineDossierSFIP + "/tests/sfip2";

Object.keys(testAPIs).forEach((API) => {
  describe("Mots-clefs", function () {
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

    describe("Création", function () {
      let motsClefs: string[]
      let idMotClef: string;
      let fOublier: schémaFonctionOublier;

      before(async () => {
        fOublier = await client.motsClefs!.suivreMotsClefs((x)=> motsClefs = x)
      })

      after(async () => {
        if (fOublier) fOublier();
      })
      step("Pas de mots-clefs pour commencer", async() => {
        expect(motsClefs).to.be.an.empty("array")
      })
      step("Créer des mots-clefs", async () => {
        idMotClef = await client.motsClefs!.créerMotClef()
        expect(motsClefs).to.be.an("array").with.lengthOf(1)
      })
      step("Effacer un mot-clef", async () => {
        await client.motsClefs!.effacerMotClef(idMotClef);
        expect(motsClefs).to.be.an.empty("array");
      })
    })

    describe("Noms", function () {
      const rés: {ultat: {[key: string]: string}|undefined, ultat2: {[key: string]: string}|undefined} = {ultat: undefined, ultat2: undefined}
      let idMotClef: string;
      let fOublier: schémaFonctionOublier;

      before(async () => {
        idMotClef = await client.motsClefs!.créerMotClef();
        fOublier = await client.motsClefs!.suivreNomsMotClef(idMotClef, (n)=> rés["ultat"] = n)
      })

      after(async () => {
        if (fOublier) fOublier();
      })

      step("Pas de noms pour commencer", async () => {
        await attendreRésultat(rés, "ultat")
        expect(rés.ultat).to.be.empty
      });

      step("Ajouter un nom", async () => {
        await client.motsClefs!.sauvegarderNomMotClef(idMotClef, "fr", "Hydrologie")
        expect(rés.ultat?.fr).to.equal("Hydrologie");
      })

      step("Ajouter des noms", async () => {
        await client.motsClefs!.ajouterNomsMotClef(idMotClef, {"த": "நீரியல்", "हिं": "जल विज्ञान"})
        expect(rés.ultat).to.deep.equal({"த": "நீரியல்", "हिं": "जल विज्ञान", "fr": "Hydrologie"});
      })

      step("Changer un nom", async () => {
        await client.motsClefs!.sauvegarderNomMotClef(idMotClef, "fr", "hydrologie")
        expect(rés.ultat?.fr).to.equal("hydrologie");
      })

      step("Effacer un nom", async () => {
        await client.motsClefs!.effacerNomMotClef(idMotClef, "fr")
        expect(rés.ultat).to.deep.equal({"த": "நீரியல்", "हिं": "जल विज्ञान"});
      })

    })

    describe("Copier mots-clefs", function () {
      let motsClefs: string[]
      let noms: {[key: string]: string}

      let idMotClef: string;
      let fOublier: schémaFonctionOublier;
      let fOublier2: schémaFonctionOublier;

      before(async () => {
        fOublier = await client.motsClefs!.suivreMotsClefs((x)=> motsClefs = x)

        idMotClef = await client.motsClefs!.créerMotClef()
        await client.motsClefs!.ajouterNomsMotClef(idMotClef, {"த": "நீரியல்", "हिं": "जल विज्ञान"})

        const idMotClef2 = await client.motsClefs!.copierMotClef(idMotClef)
        fOublier2 = await client.motsClefs!.suivreNomsMotClef(idMotClef2, (x)=> noms = x)

      })

      after(async () => {
        if (fOublier) fOublier();
        if (fOublier2) fOublier2();
      })

      it("Le mot-clef est copié", async () => {
        expect(motsClefs).to.be.an("array").that.contains(idMotClef)
      });

      it("Les noms sont copiés", async () => {
        expect(noms).to.deep.equal({"த": "நீரியல்", "हिं": "जल विज्ञान"})
      });
    })
  });
});

if (LOG)
  setTimeout(function () {
    log(); // logs out active handles that are keeping node running
  }, 10000);
