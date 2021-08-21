import log from 'why-is-node-running'
import { Controller } from 'ipfsd-ctl/src/types';
import { expect } from "chai";

import ClientConstellation, { adresseOrbiteValide } from "../client"
import rmrf from 'rimraf'
import { connectPeers } from "orbit-db-test-utils";

import OrbitDB, { KeyValueStore } from "orbit-db";

import { startIpfs, stopIpfs, testAPIs, config } from './sfipTest';

const LOG = false

const racineDossierSFIP = "./constellation"
const dbPath1 = racineDossierSFIP + '/tests/sfip'
const dbPath2 = racineDossierSFIP + '/tests/sfip2'

Object.keys(testAPIs).forEach(API => {
  describe("adresseOrbiteValide", function() {
    it("adresse orbite est valide", () => {
      const valide = adresseOrbiteValide("/orbitdb/zdpuAsiATt21PFpiHj8qLX7X7kN3bgozZmhEVswGncZYVHidX/7e0cde32-7fee-487c-ad6e-4247f627488e")
      expect(valide).to.be.true
    })
    it("CID SFIP n'est pas valide", () => {
      const valide = adresseOrbiteValide("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ")
      expect(valide).to.be.false
    })
  })
  describe("client", function() {
    this.timeout(config.timeout)

    let ipfsd1: Controller, ipfsd2: Controller, ipfs1, ipfs2, orbitdb1: OrbitDB, orbitdb2: OrbitDB

    before(async () => {
      rmrf.sync(dbPath1)
      rmrf.sync(dbPath2)
      ipfsd1 = await startIpfs(API, config.daemon1)
      ipfsd2 = await startIpfs(API, config.daemon2)
      ipfs1 = ipfsd1.api
      ipfs2 = ipfsd2.api
      orbitdb1 = await OrbitDB.createInstance(ipfs1, { directory: dbPath1 })
      orbitdb2 = await OrbitDB.createInstance(ipfs2, { directory: dbPath2 })
      await connectPeers(ipfs1, ipfs2)
    })

    after(async () => {
      if(orbitdb1)
        await orbitdb1.stop()

      if(orbitdb2)
        await orbitdb2.stop()

      if (ipfsd1)
        await stopIpfs(ipfsd1)

      if (ipfsd2)
        await stopIpfs(ipfsd2)

      rmrf.sync(racineDossierSFIP)
    })

    describe("ClientConstellation", function() {
      let client: ClientConstellation
      let client2: ClientConstellation

      before(async () => {
        client = await ClientConstellation.créer(undefined, undefined, orbitdb1);
        client2 = await ClientConstellation.créer(undefined, undefined, orbitdb2);
      })

      it("Le client devrait être initialisé", async () => {
        expect(client.prêt).to.be.true;
      });

      describe("Signer", function() {
        it("La signature devrait être valide", async () => {
          const message = "Je suis un message";
          const signature = await client.signer(message);
          const valide = await client.vérifierSignature(signature, message);
          expect(valide).to.be.true;
        });
        it("La signature ne devrait pas être valide pour un autre message", async () => {
          const message = "Je suis un message";
          const autreMessage = "Je suis un message!";
          const signature = await client.signer(message);
          const valide = await client.vérifierSignature(signature, autreMessage);
          expect(valide).to.be.false;
        });
      })

      describe("Contrôl dispositifs", function () {
        it("Mon dispositif est présent", async () => {
          const monId = client.orbite!.identity.id
          const f = (dispositifs: string[]) => {
            expect(dispositifs).to.be.an('array').that.has.lengthOf(1).and.that.includes(monId)
          }
          const oublier = await client.suivreDispositifs(f)
          oublier()
        });
        describe("Ajouter dispositif", function () {
          it("Le nouveau dispositif est présent")
          it("Le nouveau dispositif peut modifier mes BDs")
        })
      });

      describe("Rejoindre compte", function() {
        it("Je peux rejoindre un compte")
        it("Mes dispositifs sont mis à jour")
        it("Je peux modifier le nouveau compte")
        it("idBdRacine est suivie correctement")
        it("idOrbite ne change pas")
      })

      describe("Contrôl accès BDs", function() {
        describe("Accès membre", function() {
          it("Le membre peut modifier la BD")
          it("Le membre ne peut pas inviter d'autres membres")
        })

        describe("Accès mod", function() {
          it("Le mod peut modifier la BD")
          it("Le mod peut inviter d'autres membres")
          it("Le mod peut inviter d'autres mods")
        })

        describe("Suivre accès", function() {
          it("Les nouveaux membres sont présents")
        })
      })

      describe("Copier contenu BD liste de clef", function() {
        it("Les données furent copiées")
      })

      describe("Suivre BD", function() {
        it("Les données initiales sont détectées")
        it("Les changements sont détectés")
      })

      describe("Suivre BD de fonction", function() {
        it("`undefined` est retourné si la fonction ne renvoie pas de BD")
        it("Les changements à la BD suivie sont détectés")
        it("Les changements à l'id de la BD suivie sont détectés")
      })

      describe("Suivre BD de clef", function() {
        it("`undefined` est retourné si la clef n'existe pas")
        it("Les changements à la BD suivie sont détectés")
        it("Les changements à la clef sont détectés")
      })

      describe("Suivre BD dic de clef", function() {
        it("`undefined` est retourné si la clef n'existe pas")
        it("Les données sont retournés en format objet")
      })

      describe("Suivre BD dic de clef", function() {
        it("`undefined` est retourné si la clef n'existe pas")
        it("Les données sont retournés en format objet")
      })

      describe("Suivre BD liste de clef", function() {
        it("`undefined` est retourné si la clef n'existe pas")
        it("Avec renvoyer valeur")
        it("Sans renvoyer valeur")
      })

      describe("Suivre BD liste", function() {
        it("Avec renvoyer valeur")
        it("Sans renvoyer valeur")
      })

      describe("Rechercher élément BD liste selon empreinte", function() {
        it("On retrouve le bon élément")
        it("`undefined` est retourné si l'empreinte n'existe pas")
      })

      describe("Suivre BDs de BD liste", function() {
        it("Les éléments sont retournés")
      })

      describe("Suivre BDs de fonction liste", function() {
        it("Avec l'id BD comme branche")
        it("Avec branche complèxe")
        it("Avec branche complèxe sans fCode")
        it("Avec fRéduction complèxe")
      })

      describe("Suivre BDs selon condition", function() {
        it("Seules les bonnes BDs sont retournées")
        it("Les changements aux conditions sont détectés")
      })

      describe("Rechercher BD liste", function() {
        it("On retrouve l'élément")
        it("`undefined` est retourné si l'élément n'existe pas")
      })

      describe("Opérations SFIP", function() {
        it("On ajoute un fichier au SFIP")
        it("On télécharge le fichier du SFIP")
        it("On télécharge le fichier en tant que flux")
      })

      describe("Ouvrir BD", function() {
        let idBd: string

        before(async ()=>{
          idBd = await client.créerBdIndépendante("kvstore");
        })

        it("On obtient la BD", async () => {
          const bd = await client.ouvrirBd(idBd);
          expect(adresseOrbiteValide(bd.address.toString())).to.be.true;
        })
        it("On évite la concurrence", async () => {
          const bds = await Promise.all([1,2].map(async () => {
            return await client.ouvrirBd(idBd);
          }))
          expect(bds[0] === bds[1]).to.be.true;
        })
      })

      describe("Obtenir ID BD", function() {
        let idRacine: string
        let bdRacine: KeyValueStore
        let idBd: string

        before(async () => {
          idRacine = await client.créerBdIndépendante("kvstore");
          bdRacine = await client.ouvrirBd(idRacine)

          idBd = await client.créerBdIndépendante("feed");
          await bdRacine.put("clef", idBd);
        });

        it("Avec racine chaîne", async() => {
          const idBdRetrouvée = await client.obtIdBd("clef", idRacine);
          expect(idBdRetrouvée).to.equal(idBd);
        });

        it("Avec racine BD", async() => {
          const idBdRetrouvée = await client.obtIdBd("clef", bdRacine);
          expect(idBdRetrouvée).to.equal(idBd);
        });

        it("Avec mauvais type spécifié", async() => {
          const idBdRetrouvée = await client.obtIdBd("clef", bdRacine, "kvstore");
          expect(idBdRetrouvée).to.be.undefined;
        });

        it("On crée la BD si elle n'existait pas", async () => {
          const idBdRetrouvée = await client.obtIdBd("je n'existe pas encore", bdRacine, "feed")
          expect(adresseOrbiteValide(idBdRetrouvée)).to.be.true
        });

        it("Mais on ne crée pas la BD on n'a pas la permission sur la BD racine", async () => {
          const idBdRetrouvée = await client2.obtIdBd("et moi je n'existerai jamais", bdRacine, "feed")
          expect(idBdRetrouvée).to.be.undefined
        });
      })

      describe("Créer BD indépendante", function() {
        it("La BD est crée", async () => {
          const idBd = await client.créerBdIndépendante("kvstore");
          expect(adresseOrbiteValide(idBd)).to.be.true
        })
        it("Avec l'accès de l'utilisateur")
        it("Avec accès personalisé")
      })

      describe("Effacer BD", function() {
        let idBd: string
        before(async () => {
          idBd = await client.créerBdIndépendante("kvstore");
          const bd = await client.ouvrirBd(idBd) as KeyValueStore
          await bd.put("test", 123)
        })

        it("Les données n'existent plus", async () => {
          await client.effacerBd(idBd)
          const bd = await client.ouvrirBd(idBd) as KeyValueStore;
          const val = await bd.get("test");
          expect(val).to.be.undefined;
        })
      })

      describe("Suivre permission", function() {
        it("On détecte l'ajout d'une permission membre")
        it("On détecte l'ajout d'une permission modératrice")
      })

      describe("Suivre permission écrire", function() {
        it("On détecte l'ajout d'une permission membre")
        it("On détecte l'ajout d'une permission modératrice")
      })

      describe("Suivre accès BD", function() {
        it("On détecte l'ajout d'une permission membre")
        it("On détecte l'ajout d'une permission modératrice")
      })

      describe("Épingler BD", function() {
        it("La BD est épinglée")
        it("Récursion KVStore")
        it("Récursion FeedStore")
        it("Les fichiers SFIP sont également épinglés")
      })

      after(async () => {
        if (client)
          await client.fermer()
        if (client2)
          await client2.fermer()
      })
    });
  });
});

if (LOG)
  setTimeout(function () {
    log() // logs out active handles that are keeping node running
  }, 10000)
