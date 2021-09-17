import { v4 as uuidv4 } from "uuid";
import { FeedStore, élémentFeedStore } from "orbit-db";

import ClientConstellation, { schémaFonctionSuivi } from "./client";

export type formatTélécharger = "ods" | "xls" | "xlsx" | "csv" | "txt";

export interface fréquence {
  unités: "années" | "mois" | "semaines" | "jours" | "heures" | "minutes";
  n: number
}

export type typeObjetExportation = "projet" | "bd" | "tableau"

export interface SpécificationAutomatisation {
  id: string;
  fréquence: fréquence;
  type: "importation" | "exportation"
}

export interface SpécificationExporter extends SpécificationAutomatisation {
  type: "exportation";
  idObjet: string;
  typeObjet: typeObjetExportation;
  dispositifs: string[];
  format: formatTélécharger;
  inclureFichiersSFIP: boolean;
  fichierLocal: string;
}

export interface SpécificationImporter extends SpécificationAutomatisation {
  type: "importation";
  idTableau: string;
  dispositif: string;
  fichierLocal: string;
}

export interface SpécificationImporterJSON extends SpécificationImporter {

}

export interface SpécificationImporterFeuilleCalcul extends SpécificationImporter {
  cols: { [key: string]: string }
}

interface Automatisation {}

export default class Automatisations {
  client: ClientConstellation;
  idBd: string;

  automatisations: Automatisation[];

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;

    this.automatisations = [];
  }

  async ajouterAutomatisationExporter(
    id: string,
    type: typeObjetExportation,
    format: formatTélécharger,
    inclureFichiersSFIP: boolean,
    fréquence: fréquence,
    dispositifs?: string[]
  ): Promise<string> {
    const élément: SpécificationExporter = {
      type: "exportation",
      id: uuidv4(),
      idObjet: id,
      typeObjet: type,
      dispositifs: dispositifs || [this.client.orbite!.identity.id],
      fréquence,
      format,
      inclureFichiersSFIP
    }
    const bd = await this.client.ouvrirBd(this.idBd) as FeedStore;
    const idÉlément = await bd.add(élément);
    return idÉlément
  }

  async ajouterAutomatisationImporter(
    id: string,
    fréquence: fréquence,
    type: "JSON" | "FeuilleCalcul",
    dispositif?: string
  ): Promise<string> {
    let élément: SpécificationImporterFeuilleCalcul | SpécificationImporterJSON
    const bd = await this.client.ouvrirBd(this.idBd) as FeedStore;

    if (type === "JSON") {
      élément = {
        type: "importation",
        id: uuidv4(),
        idTableau: id,
        dispositif: dispositif || this.client.orbite!.identity.id,
        fréquence
      }
    } else {
      élément = {
        type: "importation",
        id: uuidv4(),
        idTableau: id,
        dispositif: dispositif || this.client.orbite!.identity.id,
        fréquence
      }
    }

    const idÉlément = await bd.add(élément);
    return idÉlément
  }

  async annulerAutomatisation(
    id: string
  ): Promise<void> {
    const élément = await this.client.rechercherBdListe(this.idBd,
      (é: élémentFeedStore<SpécificationAutomatisation>) => é.payload.value.id === id
    );
    const bd = await this.client.ouvrirBd(this.idBd) as FeedStore;
    await bd.remove(élément.hash)
  }

  async suivreAutomatisations(
    f: schémaFonctionSuivi<SpécificationAutomatisation>, idRacine?: string
  ) {
    idRacine = idRacine || this.idBd;
    return await this.client.suivreBdListe(this.idBd, f)
  }
}
