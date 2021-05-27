import { v4 as uuidv4 } from "uuid";
import { FeedStore, KeyValueStore } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
  élémentsBd,
} from "./client";

interface InfoCol {
  id: string;
  variable: string;
}

export function élémentsÉgaux(
  élément1: { [key: string]: élémentsBd },
  élément2: { [key: string]: élémentsBd }
): boolean {
  const clefs1 = Object.keys(élément1);
  const clefs2 = Object.keys(élément2);
  if (!clefs1.every((x) => élément1[x] === élément2[x])) return false;
  if (!clefs2.every((x) => élément1[x] === élément2[x])) return false;
  return true;
}

export default class Tableaux {
  client: ClientConstellation;

  constructor(client: ClientConstellation) {
    this.client = client;
  }

  async créerTableau(): Promise<string> {
    const idBdTableau = await this.client.créerBDIndépendante("kvstore");
    return idBdTableau;
  }

  async suivreDonnées(
    idTableau: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListeDeClef(
      idTableau,
      "données",
      f,
      false
    );
  }

  async ajouterÉlément(
    idTableau: string,
    vals: { [key: string]: élémentsBd }
  ): Promise<string> {
    const idBdDonnées = await this.client.obtIdBd("données", idTableau, "feed");
    if (!idBdDonnées)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdDonnées = (await this.client.ouvrirBd(idBdDonnées)) as FeedStore;
    vals = await this.vérifierClefsÉlément(idTableau, vals);
    const id = uuidv4();
    return await bdDonnées.add({ ...vals, id });
  }

  async modifierÉlément(
    idTableau: string,
    vals: { [key: string]: élémentsBd },
    empreintePrécédente: string
  ): Promise<string | void> {
    const idBdDonnées = await this.client.obtIdBd("données", idTableau, "feed");
    if (!idBdDonnées)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdDonnées = (await this.client.ouvrirBd(idBdDonnées)) as FeedStore;

    const précédent = this.client.obtÉlémentBdListeSelonEmpreinte(
      bdDonnées,
      empreintePrécédente
    );

    let élément = Object.assign({}, précédent, vals);

    Object.keys(vals).map((c: string) => {
      if (vals[c] === undefined) delete élément[c];
    });
    élément = await this.vérifierClefsÉlément(idTableau, élément);

    if (!élémentsÉgaux(élément, précédent)) {
      const résultat = await Promise.all([
        bdDonnées.remove(empreintePrécédente),
        bdDonnées.add(élément),
      ]);
      return résultat[1];
    }
    return Promise.resolve();
  }

  async vérifierClefsÉlément(
    idTableau: string,
    élément: { [key: string]: any }
  ): Promise<{ [key: string]: any }> {
    const idBdColonnes = await this.client.obtIdBd(
      "colonnes",
      idTableau,
      "feed"
    );
    if (!idBdColonnes)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdColonnes = (await this.client.ouvrirBd(idBdColonnes)) as FeedStore;
    const idsColonnes: string[] = bdColonnes
      .iterator({ limit: -1 })
      .collect()
      .map((e: { [key: string]: any }) => e.payload.value.id);
    const clefsPermises = [...idsColonnes, "id"];
    const clefsFinales = Object.keys(élément).filter((x: string) =>
      clefsPermises.includes(x)
    );
    return Object.fromEntries(clefsFinales.map((x: string) => [x, élément[x]]));
  }

  async effacerÉlément(
    idTableau: string,
    empreinteÉlément: string
  ): Promise<void> {
    const idBdDonnées = await this.client.obtIdBd("données", idTableau, "feed");
    if (!idBdDonnées)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdDonnées = (await this.client.ouvrirBd(idBdDonnées)) as FeedStore;
    await bdDonnées.remove(empreinteÉlément);
  }

  async ajouterNomsTableau(
    id: string,
    noms: { [key: string]: string }
  ): Promise<void> {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    for (const lng in noms) {
      await bdNoms.set(lng, noms[lng]);
    }
  }

  async sauvegarderNomTableau(
    id: string,
    langue: string,
    nom: string
  ): Promise<void> {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    await bdNoms.set(langue, nom);
  }

  async effacerNomTableau(id: string, langue: string): Promise<void> {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    await bdNoms.del(langue);
  }

  async suivreNomsTableau(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef(id, "noms", f);
  }

  async ajouterColonneTableau(
    idTableau: string,
    idVariable: string
  ): Promise<void> {
    const idBdColonnes = await this.client.obtIdBd(
      "colonnes",
      idTableau,
      "feed"
    );
    if (!idBdColonnes)
      throw `Permission de modification refusée pour BD ${idTableau}.`;

    const bdColonnes = (await this.client.ouvrirBd(idBdColonnes)) as FeedStore;
    const entrée: InfoCol = {
      id: uuidv4(),
      variable: idVariable,
    };
    await bdColonnes.add(entrée);
  }

  async suivreColonnes(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const fBranche = async (
      id: string,
      fSuivi: schémaFonctionSuivi,
      branche: unknown
    ): Promise<schémaFonctionOublier> => {
      return await this.client.variables!.suivreCatégorieVariable(
        id,
        async (catégorie: string) => {
          const col = Object.assign({ catégorie }, branche as InfoCol);
          fSuivi(col);
        }
      );
    };
    const fIdBdDeBranche = (x: unknown) => (x as InfoCol).variable;

    const fCode = (x: InfoCol) => x.id;
    const fSuivreBdColonnes = async (
      id: string,
      f: schémaFonctionSuivi
    ): Promise<schémaFonctionOublier> => {
      return await this.client.suivreBdsDeBdListe(
        id,
        f,
        fBranche,
        fIdBdDeBranche,
        undefined,
        fCode
      );
    };

    return await this.client.suivreBdDeClef(
      id,
      "colonnes",
      f,
      fSuivreBdColonnes
    );
  }

  async suivreVariables(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const fSuivreBdColonnes = async (
      id: string,
      f: schémaFonctionSuivi
    ): Promise<schémaFonctionOublier> => {
      return await this.client.suivreBdListe(id, (cols: InfoCol[]) =>
        f(cols.map((c) => c.variable))
      );
    };
    return await this.client.suivreBdDeClef(
      id,
      "colonnes",
      f,
      fSuivreBdColonnes
    );
  }

  async effacerTableau(id: string): Promise<void> {
    // Effacer toutes les composantes du tableau
    for (const clef in ["noms"]) {
      const idBd = await this.client.obtIdBd(clef, id);
      if (idBd) await this.client.effacerBD(idBd);
    }
    // Effacer le tableau lui-même
    await this.client.effacerBD(id);
  }
}
