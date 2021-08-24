import log from "why-is-node-running";
import { Controller } from "ipfsd-ctl/src/types";
import { expect } from "chai";
import { v4 as uuidv4 } from "uuid";
import { step } from "mocha-steps";
import assert from "assert";
import { once } from "events";
import rmrf from "rimraf";
import { connectPeers } from "orbit-db-test-utils";

import { MEMBRE, MODÉRATEUR } from "../../accès/consts";
import { enregistrerContrôleurs } from "../../accès";
import ContrôleurConstellation from "../../accès/contrôleurConstellation";

import OrbitDB, { KeyValueStore } from "orbit-db";

import { startIpfs, stopIpfs, testAPIs, config } from "../sfipTest";
import { peutÉcrire, fermerBd, attendreSync } from "../utils";

const LOG = false;

const racineDossierSFIP = "./constellation";
const dbPath1 = racineDossierSFIP + "/tests/sfip";
const dbPath2 = racineDossierSFIP + "/tests/sfip2";
const dbPath3 = racineDossierSFIP + "/tests/sfip3";
const dbPath4 = racineDossierSFIP + "/tests/sfip4";

Object.keys(testAPIs).forEach((API) => {
  describe("Contrôleur Constellation", function () {
    this.timeout(config.timeout);
    let ipfsd1: Controller,
      ipfsd2: Controller,
      ipfsd3: Controller,
      ipfsd4: Controller,
      ipfs1,
      ipfs2,
      ipfs3,
      ipfs4,
      orbitdb1: OrbitDB,
      orbitdb2: OrbitDB,
      orbitdb3: OrbitDB,
      orbitdb4: OrbitDB;

    before(async () => {
      rmrf.sync(racineDossierSFIP);

      ipfsd1 = await startIpfs(API, config.daemon1);
      ipfsd2 = await startIpfs(API, config.daemon2);
      ipfsd3 = await startIpfs(API, config.daemon2);
      ipfsd4 = await startIpfs(API, config.daemon2);
      ipfs1 = ipfsd1.api;
      ipfs2 = ipfsd2.api;
      ipfs3 = ipfsd3.api;
      ipfs4 = ipfsd4.api;

      enregistrerContrôleurs();

      orbitdb1 = await OrbitDB.createInstance(ipfs1, { directory: dbPath1 });
      orbitdb2 = await OrbitDB.createInstance(ipfs2, { directory: dbPath2 });
      orbitdb3 = await OrbitDB.createInstance(ipfs3, { directory: dbPath3 });
      orbitdb4 = await OrbitDB.createInstance(ipfs4, { directory: dbPath4 });
      await connectPeers(ipfs1, ipfs2);
      await connectPeers(ipfs1, ipfs3);
      await connectPeers(ipfs3, ipfs2);
      await connectPeers(ipfs1, ipfs4);
      await connectPeers(ipfs2, ipfs4);
      await connectPeers(ipfs3, ipfs4);
    });

    describe("Accès utilisateur", function () {

      describe("Accès par id Orbite", function () {

        let bd: KeyValueStore;

        before(async () => {
          bd = await orbitdb1.kvstore(uuidv4(), {
            accessController: {
              type: "controlleur-constellation",
              premierMod: orbitdb1.identity.id,
            },
          });
          await bd.load();
        });

        it("Le premier mod peut écrire à la BD", async () => {
          const autorisé = await peutÉcrire(bd);
          expect(autorisé).to.be.true;
        });

        it("Quelqu'un d'autre ne peut pas écrire à la BD", async () => {
          const bdOrbite2 = (await orbitdb2.open(bd.id)) as KeyValueStore;
          await bdOrbite2.load();

          const autorisé = await peutÉcrire(bdOrbite2, true);

          await fermerBd(bdOrbite2);
          expect(autorisé).to.be.false;
        });

        it("...mais on peut l'inviter !", async () => {
          await bd.access.grant(MEMBRE, orbitdb2.identity.id);

          const bdOrbite2 = (await orbitdb2.open(bd.id)) as KeyValueStore;
          await bdOrbite2.load();

          const autorisé = await peutÉcrire(bdOrbite2, true);

          await fermerBd(bdOrbite2);
          expect(autorisé).to.be.true;
        });

        after(async () => {
          await fermerBd(bd);
        });
      });

      describe("Accès par id BD racine", function () {
        let bdRacine: KeyValueStore;
        let bdRacine2: KeyValueStore;
        let bd: KeyValueStore;
        let bdOrbite2: KeyValueStore;

        before(async () => {
          bdRacine = await orbitdb1.kvstore(uuidv4(), {
            accessController: {
              type: "controlleur-constellation",
              premierMod: orbitdb1.identity.id,
            },
          });
          await bdRacine.load();

          bdRacine2 = await orbitdb2.kvstore(uuidv4(), {
            accessController: {
              type: "controlleur-constellation",
              premierMod: orbitdb2.identity.id,
            },
          });
          await bdRacine2.load();

          bd = await orbitdb1.kvstore(uuidv4(), {
            accessController: {
              type: "controlleur-constellation",
              premierMod: bdRacine.id,
            },
          });
          await bd.load();
        });

        step("Le premier mod peut écrire à la BD", async () => {
          const autorisé = await peutÉcrire(bd);
          expect(autorisé).to.be.true;
        });

        step("Quelqu'un d'autre ne peut pas écrire à la BD", async () => {
          bdOrbite2 = (await orbitdb2.open(bd.id)) as KeyValueStore;
          await bdOrbite2.load();

          const autorisé = await peutÉcrire(bdOrbite2, true);
          expect(autorisé).to.be.false;
        });

        step("...mais on peut toujours l'inviter !", async () => {
          await bd.access.grant(MEMBRE, bdRacine2.id);

          const autorisé = await peutÉcrire(bdOrbite2, true);

          expect(autorisé).to.be.true;
        });

        step("Un membre ne peut pas inviter d'autres personnes", async () => {
          await assert.rejects(bdOrbite2.access.grant(MEMBRE, orbitdb3.identity.id))
        });

        step("Mais un membre peut s'inviter lui-même", async () => {
          await bdRacine2.access.grant(MODÉRATEUR, orbitdb3.identity.id);
          console.log("accèsBdRacine2", bdRacine2.access.gestRôles._rôlesIdOrbite)
          console.log("idBdRacine2", bdRacine2.id)
          console.log("idAccèsBdRacine2", bdRacine2.access.bd.id)

          const bdOrbite3 = (await orbitdb3.open(bd.id)) as KeyValueStore;
          await bdOrbite3.load()

          const bdRacine2Orbite3 = await orbitdb3.open(bdRacine2.id) as KeyValueStore
          await bdRacine2Orbite3.load()

          // await attendreSync(bdRacine2Orbite3)
          const dormir = (milliseconds: number) => {
            return new Promise((resolve) => setTimeout(resolve, milliseconds));
          };

          await dormir(5000)
          console.log("bdOrbite3", bdOrbite3.access.gestRôles._rôlesUtilisateurs)

          console.log(bdOrbite3.access.gestRôles._rôles)
          console.log("bdorbite1", orbitdb1.identity.id)
          console.log("bdorbite2", orbitdb2.identity.id)
          console.log("bdorbite3", orbitdb3.identity.id)

          const autorisé = await peutÉcrire(bdOrbite3)

          await fermerBd(bdOrbite3);
          expect(autorisé).to.be.true;

        })
        step("On peut inviter un modérateur", async () => {
          const accès = (bd.access as ContrôleurConstellation)
          await accès.grant(MODÉRATEUR, bdRacine2.id);
          const estUnMod = await accès.estUnModérateur(orbitdb2.identity.id);
          expect(estUnMod).to.be.true;
        });

        step("Un modérateur peut inviter d'autres membres", async () => {
          const accès = (bdOrbite2.access as ContrôleurConstellation)
          await accès.grant(MEMBRE, orbitdb4.identity.id)

          const bdOrbite4 = (await orbitdb4.open(bd.id)) as KeyValueStore;
          await bdOrbite4.load()

          const autorisé = await peutÉcrire(bdOrbite4, true);

          await fermerBd(bdOrbite4);
          expect(autorisé).to.be.true;
        });

        step("Un modérateur peut inviter d'autres modérateurs", async () => {
          const accès = (bdOrbite2.access as ContrôleurConstellation)
          await accès.grant(MODÉRATEUR, orbitdb4.identity.id)

          const estUnMod = await accès.estUnModérateur(orbitdb4.identity.id);
          expect(estUnMod).to.be.true;
        });

        step("Invitations transitives suite lors de bd.load()", async () => {
          await fermerBd(bd);
          bd = await orbitdb1.open(bd.id) as KeyValueStore;
          await bd.load();
          console.log("autorisés", bd.access.gestRôles._rôles)

          const accès = (bd.access as ContrôleurConstellation)
          for (const o of [orbitdb1, orbitdb2, orbitdb3, orbitdb4]) {
            const estAutorisé = await accès.estAutorisé(o.identity.id)
            expect(estAutorisé).to.be.true
          }


        });

        after(async () => {
          await fermerBd(bd);
          if (bdOrbite2) await fermerBd(bdOrbite2);
        });
      });
    });

    after(async () => {
      if (orbitdb1) await orbitdb1.stop();

      if (orbitdb2) await orbitdb2.stop();

      if (orbitdb3) await orbitdb3.stop();
      if (orbitdb4) await orbitdb3.stop();

      if (ipfsd1) await stopIpfs(ipfsd1);

      if (ipfsd2) await stopIpfs(ipfsd2);

      if (ipfsd3) await stopIpfs(ipfsd3);
      if (ipfsd4) await stopIpfs(ipfsd3);

      rmrf.sync(racineDossierSFIP);
    });
  });
});

if (LOG)
  setTimeout(function () {
    log(); // logs out active handles that are keeping node running
  }, 10000);
