import { FeedStore, KeyValueStore } from "orbit-db";
import { nomType as typeContrôleurAccèsConst } from "./accès/contrôleurConstellation";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
} from "./client";
import { STATUT } from "./bds";
import ContrôleurConstellation from "./accès/contrôleurConstellation";

export default class Projets {
  client: ClientConstellation;
  idBd: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;

    this.migrerProjets();
  }

  async suivreProjetsMembre(
    f: schémaFonctionSuivi<string[]>,
    idBdRacine?: string
  ): Promise<schémaFonctionOublier> {
    idBdRacine = idBdRacine || this.idBd;
    return await this.client.suivreBdListe(idBdRacine, f);
  }

  async créerProjet(): Promise<string> {
    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const idBdProjet = await this.client.créerBdIndépendante("kvstore", {
      adresseBd: undefined,
    });
    await bdRacine.add(idBdProjet);

    const bdProjet = (await this.client.ouvrirBd(idBdProjet)) as KeyValueStore;

    const accès = bdProjet.access as unknown as ContrôleurConstellation;
    const optionsAccès = { adresseBd: accès.adresseBd };

    const idBdNoms = await this.client.créerBdIndépendante(
      "kvstore",
      optionsAccès
    );
    await bdProjet.set("noms", idBdNoms);

    const idBdDescr = await this.client.créerBdIndépendante(
      "kvstore",
      optionsAccès
    );
    await bdProjet.set("descriptions", idBdDescr);

    const idBdBds = await this.client.créerBdIndépendante("feed", optionsAccès);
    await bdProjet.set("bds", idBdBds);

    const idBdMotsClefs = await this.client.créerBdIndépendante(
      "feed",
      optionsAccès
    );
    await bdProjet.set("motsClefs", idBdMotsClefs);

    await bdProjet.set("statut", { statut: STATUT.ACTIVE });

    return idBdProjet;
  }

  async copierProjet(id: string): Promise<string> {
    const bdBase = (await this.client.ouvrirBd(id)) as KeyValueStore;
    const idNouveauProjet = await this.créerProjet();
    const nouvelleBd = (await this.client.ouvrirBd(
      idNouveauProjet
    )) as KeyValueStore;

    const idBdNoms = await bdBase.get("noms");
    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    const noms = ClientConstellation.obtObjetdeBdDic(bdNoms) as {
      [key: string]: string;
    };
    await this.ajouterNomsProjet(idNouveauProjet, noms);

    const idBdDescr = await bdBase.get("descriptions");
    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    const descriptions = ClientConstellation.obtObjetdeBdDic(bdDescr) as {
      [key: string]: string;
    };
    await this.ajouterDescriptionsProjet(idNouveauProjet, descriptions);

    const idBdMotsClefs = await bdBase.get("motsClefs");
    const bdMotsClefs = (await this.client.ouvrirBd(
      idBdMotsClefs
    )) as FeedStore;
    const motsClefs = ClientConstellation.obtÉlémentsDeBdListe(
      bdMotsClefs
    ) as string[];
    motsClefs.forEach(async (m: string) => {
      await this.ajouterMotClefProjet(idNouveauProjet, m);
    });

    const idBdBds = await bdBase.get("bds");
    const bdBds = (await this.client.ouvrirBd(idBdBds)) as FeedStore;
    const bds = ClientConstellation.obtÉlémentsDeBdListe(bdBds) as string[];
    bds.forEach(async (idBd: string) => {
      await this.ajouterBdProjet(idNouveauProjet, idBd);
    });

    const statut = (await bdBase.get("statut")) || STATUT.ACTIVE;
    await nouvelleBd.set("statut", { statut });

    return idNouveauProjet;
  }

  async migrerProjets(): Promise<void> {
    // Fonction pour migrer les BDs qui n'ont pas le bon contrôleur d'accès
    const migrerProjetSiNécessaire = async (id: string): Promise<string> => {
      const bd = await this.client.ouvrirBd(id);
      const accès = bd.access.type;
      if (accès !== typeContrôleurAccèsConst) {
        const idNouvelleBd = await this.copierProjet(id);
        await this.marquerObsolète(id, idNouvelleBd);
        return idNouvelleBd;
      }
      return id;
    };

    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const projetsExistants = ClientConstellation.obtÉlémentsDeBdListe(
      bdRacine
    ) as string[];

    // Migrer les BDs si nécessaire
    projetsExistants.forEach(async (idBd: string) => {
      const idNouvelle = await migrerProjetSiNécessaire(idBd);
      if (idBd !== idNouvelle) {
        await bdRacine.add(idNouvelle);
      }
    });
  }

  async _obtBdNoms(id: string): Promise<KeyValueStore> {
    const optionsAccès = await this.client.obtOpsAccès(id);
    const idBdNoms = await this.client.obtIdBd(
      "noms",
      id,
      "kvstore",
      optionsAccès
    );
    if (!idBdNoms)
      throw `Permission de modification refusée pour Projet ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    return bdNoms;
  }

  async ajouterNomsProjet(
    id: string,
    noms: { [key: string]: string }
  ): Promise<void> {
    const bdNoms = await this._obtBdNoms(id);
    for (const lng in noms) {
      await bdNoms.set(lng, noms[lng]);
    }
  }

  async sauvegarderNomProjet(
    id: string,
    langue: string,
    nom: string
  ): Promise<void> {
    const bdNoms = await this._obtBdNoms(id);
    await bdNoms.set(langue, nom);
  }

  async effacerNomProjet(id: string, langue: string): Promise<void> {
    const bdNoms = await this._obtBdNoms(id);
    await bdNoms.del(langue);
  }

  async _obtBdDescr(id: string): Promise<KeyValueStore> {
    const optionsAccès = await this.client.obtOpsAccès(id);
    const idBdDescr = await this.client.obtIdBd(
      "descriptions",
      id,
      "kvstore",
      optionsAccès
    );
    if (!idBdDescr)
      throw `Permission de modification refusée pour Projet ${id}.`;

    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    return bdDescr;
  }

  async ajouterDescriptionsProjet(
    id: string,
    descriptions: { [key: string]: string }
  ): Promise<void> {
    const bdDescr = await this._obtBdDescr(id);
    for (const lng in descriptions) {
      await bdDescr.set(lng, descriptions[lng]);
    }
  }

  async sauvegarderDescrProjet(
    id: string,
    langue: string,
    nom: string
  ): Promise<void> {
    const bdDescr = await this._obtBdDescr(id);
    await bdDescr.set(langue, nom);
  }

  async effacerDescrProjet(id: string, langue: string): Promise<void> {
    const bdDescr = await this._obtBdDescr(id);
    await bdDescr.del(langue);
  }

  async _obtBdMotsClefs(id: string): Promise<FeedStore> {
    const optionsAccès = await this.client.obtOpsAccès(id);
    const idBdMotsClefs = await this.client.obtIdBd(
      "motsClefs",
      id,
      "feed",
      optionsAccès
    );
    if (!idBdMotsClefs)
      throw `Permission de modification refusée pour Projet ${id}.`;

    const bdMotsClefs = (await this.client.ouvrirBd(
      idBdMotsClefs
    )) as FeedStore;
    return bdMotsClefs;
  }

  async ajouterMotClefProjet(
    idProjet: string,
    idMotClef: string
  ): Promise<void> {
    const bdMotsClefs = await this._obtBdMotsClefs(idProjet);
    const motsClefsExistants =
      ClientConstellation.obtÉlémentsDeBdListe(bdMotsClefs);
    if (!motsClefsExistants.includes(idMotClef))
      await bdMotsClefs.add(idMotClef);
  }

  async _obtBdBds(id: string): Promise<FeedStore> {
    const optionsAccès = await this.client.obtOpsAccès(id);
    const idBdBds = await this.client.obtIdBd("bds", id, "feed", optionsAccès);
    if (!idBdBds) throw `Permission de modification refusée pour Projet ${id}.`;

    const bdBds = (await this.client.ouvrirBd(idBdBds)) as FeedStore;
    return bdBds;
  }

  async ajouterBdProjet(idProjet: string, idBd: string): Promise<void> {
    const bdBds = await this._obtBdBds(idProjet);
    await bdBds.add(idBd);
  }

  async effacerBdProjet(idProjet: string, idBd: string): Promise<void> {
    const bdBds = await this._obtBdBds(idProjet);

    // Effacer l'entrée dans notre liste de bds (n'efface pas la BD elle-même)
    const entrée = bdBds
      .iterator({ limit: -1 })
      .collect()
      .find((e: { [key: string]: any }) => e.payload.value === idBd);
    await bdBds.remove(entrée.hash);
  }

  async marquerObsolète(id: string, idNouveau?: string): Promise<void> {
    const bd = (await this.client.ouvrirBd(id)) as KeyValueStore;
    bd.set("statut", { statut: STATUT.OBSOLÈTE, idNouveau });
  }

  async suivreNomsProjet(
    id: string,
    f: schémaFonctionSuivi<{ [key: string]: string }>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef<string>(id, "noms", f);
  }

  async suivreDescrProjet(
    id: string,
    f: schémaFonctionSuivi<{ [key: string]: string }>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef<string>(id, "descriptions", f);
  }

  async suivreBdsProjet(
    id: string,
    f: schémaFonctionSuivi<string[]>
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListeDeClef<string>(id, "bds", f);
  }

  async suivreVariablesProjet(
    id: string,
    f: schémaFonctionSuivi<string[]>
  ): Promise<schémaFonctionOublier> {
    const fFinale = (variables?: string[]) => {
      return f(variables || []);
    };
    const fBranche = async (
      idBd: string,
      f: schémaFonctionSuivi<string[]>
    ): Promise<schémaFonctionOublier> => {
      return await this.client.bds!.suivreVariablesBd(idBd, f);
    };
    const fSuivreBds = async (
      idBdBds: string,
      f: schémaFonctionSuivi<string[]>
    ) => {
      return await this.client.suivreBdsDeBdListe(idBdBds, f, fBranche);
    };
    return await this.client.suivreBdDeClef(id, "bds", fFinale, fSuivreBds);
  }

  async effacerProjet(id: string): Promise<void> {
    // Dabord effacer l'entrée dans notre liste de projets
    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const entrée = bdRacine
      .iterator({ limit: -1 })
      .collect()
      .find((e: { [key: string]: any }) => e.payload.value === id);
    await bdRacine.remove(entrée.hash);

    // Et puis maintenant aussi effacer les données et le projet lui-même
    const optionsAccès = await this.client.obtOpsAccès(id);
    for (const clef in ["noms", "descriptions", "motsClefs", "bds"]) {
      const idBd = await this.client.obtIdBd(clef, id, undefined, optionsAccès);
      if (idBd) await this.client.effacerBd(idBd);
    }

    await this.client.effacerBd(id);
  }
}
