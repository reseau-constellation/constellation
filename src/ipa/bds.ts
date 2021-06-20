import { FeedStore, KeyValueStore } from "orbit-db";
import { nomType as typeContrôleurAccèsConst } from "./accès/contrôleurConstellation";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
} from "./client";
import ContrôleurConstellation, {
  OptionsContrôleurConstellation,
} from "./accès/contrôleurConstellation";

export default class BDs {
  client: ClientConstellation;
  idBd: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;

    this.migrerBds();
  }

  async obtOpsAccès(idBd: string): Promise<OptionsContrôleurConstellation> {
    const bd = await this.client.ouvrirBd(idBd);
    const accès = (bd.access as unknown) as ContrôleurConstellation;
    return {
      adresseBd: accès.bd!.address,
    };
  }

  async suivreBds(
    f: schémaFonctionSuivi,
    idBdRacine?: string
  ): Promise<schémaFonctionOublier> {
    idBdRacine = idBdRacine || this.idBd;
    return await this.client.suivreBdListe(idBdRacine, f);
  }

  async créerBd(licence: string): Promise<string> {
    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const idBdBD = await this.client.créerBdIndépendante("kvstore");
    await bdRacine.add(idBdBD);

    const bdBD = (await this.client.ouvrirBd(idBdBD)) as KeyValueStore;
    await bdBD.set("licence", licence);

    const accès = (bdBD.access as unknown) as ContrôleurConstellation;
    const optionsAccès = { adresseBd: accès.adresseBd };

    const idBdNoms = await this.client.créerBdIndépendante(
      "kvstore",
      optionsAccès
    );
    await bdBD.set("noms", idBdNoms);

    const idBdDescr = await this.client.créerBdIndépendante(
      "kvstore",
      optionsAccès
    );
    await bdBD.set("descriptions", idBdDescr);

    const idBdTableaux = await this.client.créerBdIndépendante(
      "feed",
      optionsAccès
    );
    await bdBD.set("tableaux", idBdTableaux);

    const idBdMotsClefs = await this.client.créerBdIndépendante(
      "feed",
      optionsAccès
    );
    await bdBD.set("motsClefs", idBdMotsClefs);

    return idBdBD;
  }

  async copierBd(id: string): Promise<string> {
    const bdBase = (await this.client.ouvrirBd(id)) as KeyValueStore;
    const licence = await bdBase.get("licence");
    const idNouvelleBd = await this.créerBd(licence);
    const nouvelleBd = (await this.client.ouvrirBd(
      idNouvelleBd
    )) as KeyValueStore;

    const idBdNoms = await bdBase.get("noms");
    const noms = ((await this.client.ouvrirBd(idBdNoms)) as KeyValueStore).all;
    await this.ajouterNomsBd(idNouvelleBd, noms);

    const idBdDescr = await bdBase.get("descriptions");
    const descriptions = ((await this.client.ouvrirBd(
      idBdDescr
    )) as KeyValueStore).all;
    await this.ajouterDescriptionsBd(idNouvelleBd, descriptions);

    const idBdMotsClefs = await bdBase.get("motsClefs");
    const bdMotsClefs = (await this.client.ouvrirBd(
      idBdMotsClefs
    )) as FeedStore;
    const motsClefs = ClientConstellation.obtÉlémentsDeBdListe(
      bdMotsClefs
    ) as string[];
    motsClefs.forEach(async (m: string) => {
      await this.ajouterMotClefBd(idNouvelleBd, m);
    });

    const idBdTableaux = await bdBase.get("tableaux");
    const nouvelleBdTableaux = (await nouvelleBd.get("tableaux")) as FeedStore;
    const tableaux = ((await this.client.ouvrirBd(idBdTableaux)) as FeedStore)
      .iterator({ limit: -1 })
      .collect();
    tableaux.forEach(async (idT: string) => {
      const idNouveauTableau: string = await this.client.tableaux!.copierTableau(
        idT
      );
      await nouvelleBdTableaux.add(idNouveauTableau);
    });

    return idNouvelleBd;
  }

  async migrerBds(): Promise<void> {
    // Fonction pour migrer les BDs qui n'ont pas le bon contrôleur d'accès
    const migrerBdSiNécessaire = async (id: string): Promise<string> => {
      const bd = await this.client.ouvrirBd(id);
      const accès = bd.access.type;
      if (accès !== typeContrôleurAccèsConst) {
        const idNouvelleBd = await this.copierBd(id);
        await this.marquerObsolète(id, idNouvelleBd);
        return idNouvelleBd;
      }
      return id;
    };

    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const bdsExistantes = bdRacine.iterator({ limit: -1 }).collect();

    // Migrer les BDs si nécessaire
    bdsExistantes.forEach(async (idBd: string) => {
      const idNouvelle = await migrerBdSiNécessaire(idBd);
      if (idBd !== idNouvelle) {
        await this.effacerBd(idBd);
        await bdRacine.add(idNouvelle);
      }
    });
  }

  async ajouterNomsBd(
    id: string,
    noms: { [key: string]: string }
  ): Promise<void> {
    const optionsAccès = await this.obtOpsAccès(id);
    const idBdNoms = await this.client.obtIdBd(
      "noms",
      id,
      "kvstore",
      optionsAccès
    );
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;

    for (const lng in noms) {
      await bdNoms.set(lng, noms[lng]);
    }
  }

  async sauvegarderNomBD(
    id: string,
    langue: string,
    nom: string
  ): Promise<void> {
    const optionsAccès = await this.obtOpsAccès(id);
    const idBdNoms = await this.client.obtIdBd(
      "noms",
      id,
      "kvstore",
      optionsAccès
    );
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    await bdNoms.set(langue, nom);
  }

  async effacerNomBd(id: string, langue: string): Promise<void> {
    const optionsAccès = await this.obtOpsAccès(id);
    const idBdNoms = await this.client.obtIdBd(
      "noms",
      id,
      "kvstore",
      optionsAccès
    );
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    await bdNoms.del(langue);
  }

  async ajouterDescriptionsBd(
    id: string,
    descriptions: { [key: string]: string }
  ): Promise<void> {
    const optionsAccès = await this.obtOpsAccès(id);
    const idBdDescr = await this.client.obtIdBd(
      "descriptions",
      id,
      "kvstore",
      optionsAccès
    );
    if (!idBdDescr) throw `Permission de modification refusée pour BD ${id}.`;

    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    for (const lng in descriptions) {
      await bdDescr.set(lng, descriptions[lng]);
    }
  }

  async sauvegarderDescrBd(
    id: string,
    langue: string,
    nom: string
  ): Promise<void> {
    const optionsAccès = await this.obtOpsAccès(id);
    const idBdDescr = await this.client.obtIdBd(
      "descriptions",
      id,
      "kvstore",
      optionsAccès
    );
    if (!idBdDescr) throw `Permission de modification refusée pour BD ${id}.`;

    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    await bdDescr.set(langue, nom);
  }

  async effacerDescrBd(id: string, langue: string): Promise<void> {
    const optionsAccès = await this.obtOpsAccès(id);
    const idBdDescr = await this.client.obtIdBd(
      "descriptions",
      id,
      "kvstore",
      optionsAccès
    );
    if (!idBdDescr) throw `Permission de modification refusée pour BD ${id}.`;

    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    await bdDescr.del(langue);
  }

  async ajouterMotClefBd(idBd: string, idMotClef: string): Promise<void> {
    const optionsAccès = await this.obtOpsAccès(idBd);
    const idBdMotsClefs = await this.client.obtIdBd(
      "motsClefs",
      idBd,
      "feed",
      optionsAccès
    );
    if (!idBdMotsClefs)
      throw `Permission de modification refusée pour BD ${idBd}.`;

    const bdMotsClefs = (await this.client.ouvrirBd(
      idBdMotsClefs
    )) as FeedStore;
    const motsClefsExistants = ClientConstellation.obtÉlémentsDeBdListe(
      bdMotsClefs
    );
    if (!motsClefsExistants.includes(idMotClef))
      await bdMotsClefs.add(idMotClef);
  }

  async ajouterTableauBD(id: string): Promise<string> {
    const optionsAccès = await this.obtOpsAccès(id);
    const idBdTableaux = await this.client.obtIdBd(
      "tableaux",
      id,
      "feed",
      optionsAccès
    );
    if (!idBdTableaux)
      throw `Permission de modification refusée pour BD ${id}.`;

    const bdTableaux = (await this.client.ouvrirBd(idBdTableaux)) as FeedStore;
    const idTableau = await this.client.tableaux!.créerTableau();
    await bdTableaux.add(idTableau);
    return idTableau;
  }

  async effacerTableauBD(id: string, idTableau: string): Promise<void> {
    const optionsAccès = await this.obtOpsAccès(id);
    // D'abord effacer l'entrée dans notre liste de tableaux
    const idBdTableaux = await this.client.obtIdBd(
      "tableaux",
      id,
      "feed",
      optionsAccès
    );
    if (!idBdTableaux)
      throw `Permission de modification refusée pour BD ${id}.`;

    const bdTableaux = (await this.client.ouvrirBd(idBdTableaux)) as FeedStore;
    const entrée = bdTableaux
      .iterator({ limit: -1 })
      .collect()
      .find((e: { [key: string]: any }) => e.payload.value === idTableau);
    await bdTableaux.remove(entrée.hash);

    // Enfin, effacer les données et le tableau lui-même
    await this.client.tableaux!.effacerTableau(idTableau);
  }

  async marquerObsolète(id: string, idNouvelle?: string): Promise<void> {
    const bd = (await this.client.ouvrirBd(id)) as KeyValueStore;
    bd.set("statut", { statut: "obsolète", idNouvelle });
  }

  async suivreLicence(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBd(id, async (bd) => {
      const licence = await bd.get("licence");
      f(licence);
    });
  }

  async suivreNomsBd(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef(id, "noms", f);
  }

  async suivreDescrBd(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef(id, "descriptions", f);
  }

  async suivreTableauxBd(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListeDeClef(id, "tableaux", f);
  }

  async suivreScoreBd(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBd(id, () => {
      const accès = Math.floor(Math.random() * 100);
      const couv = Math.floor(Math.random() * 100);
      const passe = Math.floor(Math.random() * 100);
      f({
        total: Math.floor((accès + couv + passe) / 3),
        accès: accès,
        couverture: couv,
        passe: passe,
      });
    });
  }

  async suivreVariablesBd(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const fBranche = async (
      id: string,
      f: schémaFonctionSuivi
    ): Promise<schémaFonctionOublier> => {
      return await this.client.tableaux!.suivreVariables(id, f);
    };
    const fSuivreTableaux = async (id: string, f: schémaFonctionSuivi) => {
      return await this.client.suivreBdsDeBdListe(id, f, fBranche);
    };
    return await this.client.suivreBdDeClef(id, "tableaux", f, fSuivreTableaux);
  }

  async effacerBd(id: string): Promise<void> {
    // Dabord effacer l'entrée dans notre liste de BDs
    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const entrée = bdRacine
      .iterator({ limit: -1 })
      .collect()
      .find((e: { [key: string]: any }) => e.payload.value === id);
    await bdRacine.remove(entrée.hash);

    // Et puis maintenant aussi effacer les données et la BD elle-même
    const optionsAccès = await this.obtOpsAccès(id);
    for (const clef in ["noms", "descriptions", "motsClefs"]) {
      const idBd = await this.client.obtIdBd(clef, id, undefined, optionsAccès);
      if (idBd) await this.client.effacerBd(idBd);
    }
    const idBdTableaux = await this.client.obtIdBd(
      "tableaux",
      id,
      "feed",
      optionsAccès
    );
    if (idBdTableaux) {
      const bdTableaux = (await this.client.ouvrirBd(
        idBdTableaux
      )) as FeedStore;
      const tableaux = bdTableaux
        .iterator({ limit: -1 })
        .collect()
        .map((e: { [key: string]: any }) => e.payload.value);
      for (const t of tableaux) {
        await this.client.tableaux!.effacerTableau(t);
      }
    }
    await this.client.effacerBd(id);
  }
}
