import log from "why-is-node-running";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { step } from "mocha-steps";

chai.should();
chai.use(chaiAsPromised);

import { v4 as uuidv4 } from "uuid";

import { enregistrerContrôleurs } from "@/ipa/accès";
import ClientConstellation, {
  schémaFonctionOublier,
  adresseOrbiteValide,
} from "@/ipa/client";
import { schémaBd } from "@/ipa/réseau";
import { catégorieVariables } from "@/ipa/variables";
import { InfoCol } from "@/ipa/tableaux";
import {
  règleVariableAvecId,
  règleBornes,
  règleColonne,
  règleValeurCatégorique,
  erreurValidation,
  élémentDonnées,
  élémentBdListeDonnées,
} from "@/ipa/valid";

import { testAPIs, config } from "./sfipTest";
import { générerClients, attendreRésultat } from "./utils";

const LOG = false;

Object.keys(testAPIs).forEach((API) => {
  describe("BDs", function () {
    this.timeout(config.timeout);

    let fOublierClients: () => Promise<void>;
    let clients: ClientConstellation[];
    let client: ClientConstellation;
    let client2: ClientConstellation;

    let idBd: string;

    before(async () => {
      enregistrerContrôleurs();
      ({ fOublier: fOublierClients, clients } = await générerClients(2, API));
      client = clients[0];
      client2 = clients[0];
    });

    after(async () => {
      if (fOublierClients) await fOublierClients();
    });

    step("Création", async () => {
      idBd = await client.bds!.créerBd("ODbl-1_0");
      expect(adresseOrbiteValide(idBd)).to.be.true;
    });

    describe("Mes BDs", async () => {
      step("La BD déjà créée est présente")
      step("On crée une autre BD sans l'ajouter")
      step("On peut l'ajouter ensuite à mes bds")
      step("On peut aussi l'effacer")
    });

    describe("Noms", function () {
      let noms: { [key: string]: string };
      let fOublier: schémaFonctionOublier;

      before(async () => {
        fOublier = await client.bds!.suivreNomsBd(
          idBd,
          (n) => (noms = n)
        );
      });

      after(async () => {
        if (fOublier) fOublier();
      });

      step("Pas de noms pour commencer", async () => {
        expect(noms).to.be.empty;
      });

      step("Ajouter un nom", async () => {
        await client.bds!.sauvegarderNomBd(
          idBd,
          "fr",
          "Alphabets"
        );
        expect(noms.fr).to.equal("Alphabets");
      });

      step("Ajouter des noms", async () => {
        await client.bds!.ajouterNomsBd(idBd, {
          த: "எழுத்துகள்",
          हिं: "वर्णमाला",
        });
        expect(noms).to.deep.equal({
          fr: "Alphabets",
          த: "எழுத்துகள்",
          हिं: "वर्णमाला",
        });
      });

      step("Changer un nom", async () => {
        await client.bds!.sauvegarderNomBd(
          idBd,
          "fr",
          "Systèmes d'écriture"
        );
        expect(noms?.fr).to.equal("Systèmes d'écriture");
      });

      step("Effacer un nom", async () => {
        await client.bds!.effacerNomBd(idBd, "fr");
        expect(noms).to.deep.equal({ த: "எழுத்துகள்", हिं: "वर्णमाला" });
      });
    });

    describe("Descriptions", function () {
      let descrs: { [key: string]: string };
      let fOublier: schémaFonctionOublier;

      before(async () => {
        fOublier = await client.bds!.suivreDescrBd(
          idBd,
          (d) => (descrs =d)
        );
      });

      after(async () => {
        if (fOublier) fOublier();
      });

      step("Aucune description pour commencer", async () => {
        expect(descrs).to.be.empty;
      });

      step("Ajouter une description", async () => {
        await client.bds!.sauvegarderDescrBd(
          idBd,
          "fr",
          "Alphabets"
        );
        expect(descrs.fr).to.equal("Alphabets");
      });

      step("Ajouter des descriptions", async () => {
        await client.bds!.ajouterDescriptionsBd(idBd, {
          த: "எழுத்துகள்",
          हिं: "वर्णमाला",
        });
        expect(descrs).to.deep.equal({
          fr: "Alphabets",
          த: "எழுத்துகள்",
          हिं: "वर्णमाला",
        });
      });

      step("Changer une description", async () => {
        await client.bds!.sauvegarderDescrBd(
          idBd,
          "fr",
          "Systèmes d'écriture"
        );
        expect(descrs?.fr).to.equal("Systèmes d'écriture");
      });

      step("Effacer une description", async () => {
        await client.bds!.effacerDescrBd(idBd, "fr");
        expect(descrs).to.deep.equal({ த: "எழுத்துகள்", हिं: "वर्णमाला" });
      });
    })

    describe("Mots-clefs", function () {
      let motsClefs: string[];
      let fOublier: schémaFonctionOublier;
      let idMotClef: string;

      before(async () => {
        fOublier = await client.bds!.suivreMotsClefsBd(
          idBd,
          (m) => (motsClefs = m)
        );
      });

      after(async () => {
        if (fOublier) fOublier();
      });
      step("Pas de mots-clefs pour commencer", async () => {
        expect(motsClefs).to.be.an.empty("array");
      })
      step("Ajout d'un mot-clef", async () => {
        idMotClef = await client.motsClefs!.créerMotClef()
        await client.bds!.ajouterMotsClefsBd(idBd, idMotClef);
        expect(motsClefs).to.be.an("array").of.length(1);
      })
      step("Effacer un mot-clef", async () => {
        await client.bds!.effacerMotClefBd(idBd, idMotClef);
        expect(motsClefs).to.be.an.empty("array");
      })
    })

    describe("Copier BD", function () {
      step("À faire")
    })

    describe("Changer licence BD", function () {
      step("À faire")
    })

    describe("Statut BD", function () {
      step("À faire")
    })

    describe("Auteurs", function () {
      step("À faire")
    })

    describe("Tableaux", function () {
      let tableaux: string[];
      let fOublier: schémaFonctionOublier;
      let idTableau: string;

      before(async () => {
        fOublier = await client.bds!.suivreTableauxBd(
          idBd,
          (t) => (tableaux = t)
        );
      });

      after(async () => {
        if (fOublier) fOublier();
      });
      step("Pas de tableaux pour commencer", async () => {
        expect(tableaux).to.be.an.empty("array");
      })
      step("Ajout d'un tableau", async () => {
        idTableau = await client.bds!.ajouterTableauBd(idBd);
        expect(adresseOrbiteValide(idTableau)).to.be.true;
        expect(tableaux).to.be.an("array").of.length(1);
        expect(tableaux[0]).to.equal(idTableau)
      })
      step("Effacer un tableau", async () => {
        await client.bds!.effacerTableauBd(idBd, idTableau);
        expect(tableaux).to.be.an.empty("array");
      })
    })

    describe("Variables", function () {
      step("À faire")
    })

    describe("Score", function () {

      describe("Score accessibilité", function () {
        step("À faire")
      })

      describe("Score tests", function () {
        step("À faire")
      })

      describe("Score validité", function () {
        step("À faire")
      })

      describe("Score total", function () {
        step("À faire")
      })
    })

    describe("Exporter données", function () {
      step("À faire")
    })

    describe("Rechercher BDs", function () {
      let résultats: string[];
      let fOublier: schémaFonctionOublier;
      let idMotClef: string;
      let idBdRechercheMotsClefs: string;

      before(async () => {
        idMotClef = await client.motsClefs!.créerMotClef()

        fOublier = await client.bds!.rechercherBdsParMotsClefs(
          [idMotClef],
          (r) => (résultats = r)
        );

        idBdRechercheMotsClefs = await client.bds!.créerBd("ODbl-1_0")
      });

      after(async () => {
        if (fOublier) fOublier();
      });

      step("Pas de résultats pour commencer", async () => {
        expect(résultats).to.be.an.empty("array");
      });

      step("Ajout d'un mot-clef détecté", async () => {
        await client.bds!.ajouterMotsClefsBd(idBdRechercheMotsClefs, [idMotClef])
        expect(résultats).to.be.an("array").of.length(1);
        expect(résultats[0]).to.equal(idBdRechercheMotsClefs);
      });
    })

    describe("Suivre tableaux bds de schéma", async () => {
      let résultat: string;
      let idPremièreBd: string;

      let fOublier: schémaFonctionOublier;
      let idMotClef: string;
      let idVariable: string

      before(async () => {
        idMotClef = await client.motsClefs!.créerMotClef();
        idVariable = await client.variables!.créerVariable("numérique");

        const schéma: schémaBd = {
          tableaux: [
            {vars: [idVariable]}
          ]
        }

        fOublier = await client.bds!.suivreTableauBdDeSchéma(
          schéma,
          idMotClef,
          0,
          "ODbl-1_0",
          (r) => (résultat = r)
        );

      });

      after(async () => {
        if (fOublier) fOublier();
      });

      step("Un seul résultat pour commencer", async () => {
        await new Promise(resolve=>setTimeout(resolve, 2000));
        expect(résultat).to.exist;
        expect(adresseOrbiteValide(résultat)).to.be.true;
        idPremièreBd = résultat
      });

      step("Ajoutons une nouvelle BD", async () => {
        const idDédoublée = await client.bds!.créerBd("ODbl-1_0")
        const idTableau = await client.bds!.ajouterTableauBd(idDédoublée);
        await client.tableaux!.ajouterColonneTableau(idTableau, idVariable)
        await client.bds!.ajouterMotsClefsBd(idDédoublée, [idMotClef]);

        expect(résultat).to.exist;
        expect(résultat).to.equal(idPremièreBd);
      });


    })

  });
});

if (LOG)
  setTimeout(function () {
    log(); // logs out active handles that are keeping node running
  }, 10000);
