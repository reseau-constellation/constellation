import log from "why-is-node-running";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { step } from "mocha-steps";

import fs from "fs";
import path from "path";

chai.should();
chai.use(chaiAsPromised);

const assert = chai.assert;

import { enregistrerContrôleurs } from "@/ipa/accès";
import ClientConstellation, { schémaFonctionOublier } from "@/ipa/client";
import { infoMembreEnLigne, infoRéplication } from "@/ipa/reseau";

import { testAPIs, config } from "./sfipTest";
import { attendreRésultat, générerClients } from "./utils";

const LOG = false;

Object.keys(testAPIs).forEach((API) => {
  describe("Réseau", function () {
    this.timeout(config.timeout);

    let fOublierClients: () => Promise<void>;
    let clients: ClientConstellation[];
    let client: ClientConstellation, client2: ClientConstellation;

    before(async () => {
      ({ fOublier: fOublierClients, clients } = await générerClients(2, API));
      [client, client2] = clients;

      enregistrerContrôleurs();
    });

    after(async () => {
      if (fOublierClients) await fOublierClients();
    });

    describe("Suivre membres", function () {
      const rés: { ultat: infoMembreEnLigne[]|undefined } = { ultat: undefined };
      let fOublier: schémaFonctionOublier;

      before(async () => {
        fOublier = await client.réseau!.suivreMembres((c) => (rés.ultat = c));
      });

      after(async () => {
        if (fOublier) fOublier();
      });

      step("Autres membres détectés", async () => {
        expect(rés.ultat).to.be.an("array").with.lengthOf(2);
        expect(rés.ultat!.map(r=>r.idBdRacine)).to.include.members([
          client.idBdRacine,
          client2.idBdRacine
        ])
      });
    });

    describe("Suivre postes", function () {
      const rés: { ultat: { addr: string; peer: string; }[]|undefined } = { ultat: undefined };
      let fOublier: schémaFonctionOublier;

      before(async () => {
        fOublier = await client.réseau!.suivreConnexionsPostes((c) => (rés.ultat = c));
      });

      after(async () => {
        if (fOublier) fOublier();
      });

      step("Autres postes détectés", async () => {
        expect(rés.ultat!.map(r=>r.peer)).to.include.members([
          client2.idNodeSFIP!.id
        ]);
      });

    });

    describe("Suivre noms membre", function () {
      const rés: { ultat: {[key: string]: string}|undefined } = { ultat: undefined };
      let fOublier: schémaFonctionOublier;

      before(async () => {
        await client.compte!.sauvegarderNom("fr", "Julien");
        fOublier = await client2.réseau!.suivreNomsMembre(
          client.idBdRacine!,
          (n) => (rés.ultat = n)
        );
      });

      step("Noms détectés", async () => {
        await attendreRésultat(rés, "ultat", (x: {[key: string]: string})=>x.fr)
        expect(rés.ultat?.fr).to.exist;
        expect(rés.ultat?.fr).to.equal("Julien")
      });

      after(async () => {
        if (fOublier) fOublier();
      });
    });

    describe("Suivre courriel membre", function () {
      const rés: { ultat: string|null|undefined } = { ultat: undefined };
      let fOublier: schémaFonctionOublier;

      before(async () => {
        await client.compte!.sauvegarderCourriel("தொடர்பு@லஸ்ஸி.இந்தியா");
        fOublier = await client2.réseau!.suivreCourrielMembre(
          client.idBdRacine!,
          (c) => (rés.ultat = c)
        );
      });

      step("Courriel détecté", async () => {
        await attendreRésultat(rés, "ultat", (x: string|null|undefined)=>Boolean(x))
        expect(rés.ultat).to.equal("தொடர்பு@லஸ்ஸி.இந்தியா")
      });

      after(async () => {
        if (fOublier) fOublier();
      });
    });

    describe("Suivre image membre", function () {
      const rés: { ultat: Uint8Array | undefined | null } = { ultat: undefined };
      let fOublier: schémaFonctionOublier;

      const OCTETS = fs.readFileSync(
        path.resolve(__dirname, "../../src/assets/logo.svg")
      );
      const IMAGE: File = {
        name: "logo.png",
        path: "../../assets/logo.png",
        arrayBuffer: () => Promise.resolve(OCTETS),
        lastModified: Date.now(),
        size: 100,
        stream: () => new ReadableStream(),
        type: "image/png",
        text: () => Promise.resolve(""),
        slice: () => new Blob(),
      };

      before(async () => {
        await client.compte!.sauvegarderImage(IMAGE);
        fOublier = await client2.réseau!.suivreImageMembre(
          client.idBdRacine!,
          (i) => (rés.ultat = i)
        );
      });

      after(async () => {
        if (fOublier) fOublier();
      });

      step("Image détectée", async () => {
        await attendreRésultat(rés, "ultat", (x: Uint8Array | undefined | null)=>Boolean(x))
        expect(rés.ultat).to.deep.equal(new Uint8Array(OCTETS));
      });
    });

    describe("Suivre BDs", function () {
      let idBd: string;
      let idBd2: string;

      const rés: { ultat?: string[], ultat_2?: string[] } = {
        ultat: undefined, ultat_2: undefined
      };
      let fsOublier: schémaFonctionOublier[] = [];

      before(async () => {
        fsOublier.push(await client2.réseau!.suivreBdsMembre(
          client.idBdRacine!,
          (bds) => (rés.ultat = bds)
        ));
        fsOublier.push(await client2.réseau!.suivreBds(
          (bds) => (rés.ultat_2 = bds)
        ));

        idBd = await client.bds!.créerBd("ODbl-1_0");
      });

      after(async () => {
        fsOublier.forEach(f=>f());
      });

      step("BD d'un autre membre détectée", async () => {
        await attendreRésultat(rés, "ultat", (x?: string[])=>x && x.length);
        expect(rés.ultat).to.be.an("array").with.lengthOf(1).and.members([idBd]);
      });

      step("BDs du réseau détectées", async () => {
        idBd2 = await client2.bds!.créerBd("ODbl-1_0");
        await attendreRésultat(rés, "ultat_2", (x?: string[])=>x && x.length === 2);
        expect(rés.ultat_2).to.be.an("array").with.lengthOf(2).and.members([idBd, idBd2]);
      });
    });

    describe("Suivre réplications", function () {
      let idBd: string;

      const rés: { ultat?: infoRéplication[] } = {
        ultat: undefined
      };
      let fsOublier: schémaFonctionOublier[] = [];

      before(async () => {
        idBd = await client.bds!.créerBd("ODbl-1_0");
        fsOublier.push(await client.réseau!.suivreRéplications(
          idBd,
          (bds) => (rés.ultat = bds)
        ));
      });

      after(async () => {
        fsOublier.forEach(f=>f());
      });

      step("Auteur de la BD pour commencer", async () => {
        await client.favoris!.épinglerFavori(idBd);
        await attendreRésultat(rés, "ultat", (x?: infoRéplication[])=>x && x.length)
        expect(rés.ultat).to.be.an("array").with.lengthOf(1)
        expect(rés.ultat!.map(r=>r.idOrbite)).to.have.members([client.orbite!.identity.id]);
      });

      step("Ajout d'une réplication détectée", async () => {

        await client2.favoris!.épinglerFavori(idBd);

        await attendreRésultat(rés, "ultat", (x?: infoRéplication[])=>x && x.length === 2);
        expect(rés.ultat).to.be.an("array").with.lengthOf(2)
        expect(rés.ultat!.map(r=>r.idOrbite)).to.have.members([
          client.orbite!.identity.id,
          client2.orbite!.identity.id,
        ]);
      });
    });

    describe.only("Suivre BD par mot-clef unique", function () {
      step("Suivre BDs du réseau");
      step("Suivre éléments des BDs");
    })

  });
});

if (LOG)
  setTimeout(function () {
    log(); // logs out active handles that are keeping node running
  }, 10000);
