import { v4 as uuidv4 } from "uuid";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier
} from "./client";

export function élémentsÉgaux(élément1, élément2): boolean {
  const clefs1 = Object.keys(élément1);
  const clefs2 = Object.keys(élément2);
  if (!clefs1.every(x => élément1[x] === élément2[x])) return false;
  if (!clefs2.every(x => élément1[x] === élément2[x])) return false;
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
    const idBdDonnées = await this.client.obtIdBd("données", idTableau, "feed");
    return await this.client.suivreBdListe(idBdDonnées, f, false);
  }

  async ajouterÉlément(
    idTableau: string,
    vals: { [key: string]: any }
  ): Promise<string> {
    const idBdDonnées = await this.client.obtIdBd("données", idTableau, "feed");
    const bdDonnées = await this.client.ouvrirBD(idBdDonnées);
    vals = await this.vérifierClefsÉlément(idTableau, vals);
    const id = uuidv4();
    return await bdDonnées.add({ ...vals, id });
  }

  async modifierÉlément(
    idTableau: string,
    vals: { [key: string]: any },
    empreintePrécédente: string
  ): Promise<string | void> {
    const idBdDonnées = await this.client.obtIdBd("données", idTableau, "feed");
    const bdDonnées = await this.client.ouvrirBD(idBdDonnées);

    const précédent = bdDonnées
      .iterator({ limit: -1 })
      .collect()
      .find((e: { [key: string]: any }) => e.hash === empreintePrécédente)
      .payload.value;

    let élément = Object.assign({}, précédent, vals);

    Object.keys(vals).map((c: string) => {
      if (vals[c] === undefined) delete élément[c];
    });
    élément = await this.vérifierClefsÉlément(idTableau, élément);

    if (!élémentsÉgaux(élément, précédent)) {
      return await Promise.all([
        bdDonnées.remove(empreintePrécédente),
        bdDonnées.add(élément)
      ]);
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
    const bdColonnes = await this.client.ouvrirBD(idBdColonnes);
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
    const bdDonnées = await this.client.ouvrirBD(idBdDonnées);
    await bdDonnées.remove(empreinteÉlément);
  }

  async ajouterNomsTableau(id: string, noms: { [key: string]: string }) {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    const bdNoms = await this.client.ouvrirBD(idBdNoms);
    for (const lng in noms) {
      await bdNoms.set(lng, noms[lng]);
    }
  }

  async sauvegarderNomTableau(id: string, langue: string, nom: string) {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    const bdNoms = await this.client.ouvrirBD(idBdNoms);
    await bdNoms.set(langue, nom);
  }

  async effacerNomTableau(id: string, langue: string) {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    const bdNoms = await this.client.ouvrirBD(idBdNoms);
    await bdNoms.del(langue);
  }

  async suivreNomsTableau(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDic(id, "noms", f);
  }

  async ajouterColonneTableau(idTableau: string, idVariable: string) {
    const idBdColonnes = await this.client.obtIdBd(
      "colonnes",
      idTableau,
      "feed"
    );
    const bdColonnes = await this.client.ouvrirBD(idBdColonnes);
    const entrée = {
      id: uuidv4(),
      variable: idVariable
    };
    await bdColonnes.add(entrée);
  }

  async suivreColonnes(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const idBdListe = await this.client.obtIdBd("colonnes", id, "feed");
    // return await this.client.suivreBdListe(idBdListe, f);
    const fRacine = async (fSuivi: schémaFonctionSuivi) => {
      return await this.client.suivreBdListe(idBdListe, fSuivi);
    };
    interface InfoCol {
      id: string;
      variable: string;
    }
    const fBranche = async (infoCol: InfoCol, fSuivi: schémaFonctionSuivi) => {
      const { variable } = infoCol;
      const catégorie = await this.client.variables!.obtCatégorieVariable(
        variable
      );
      const col = Object.assign({ catégorie }, infoCol);
      await fSuivi(col);
    };
    return await this.client.suivreBdsEmboîtées(fRacine, fBranche, f);
  }

  async suivreVariables(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.suivreColonnes(id, async liste => {
      const variables = liste.map((x: any) => x.variable);
      return f(variables);
    });
  }

  async effacerTableau(id: string) {
    // Effacer toutes les composantes du tableau
    for (const clef in ["noms"]) {
      const idBd = await this.client.obtIdBd(clef, id);
      if (idBd) await this.client.effacerBD(idBd);
    }
    // Effacer le tableau lui-même
    await this.client.effacerBD(id);
  }
}
