import { v4 as uuidv4 } from "uuid";
import { isValidAddress } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier
} from "./client";

export default class Tableaux {
  client: ClientConstellation;

  constructor(client: ClientConstellation) {
    this.client = client;
  }

  async suivreTableauxBD(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBD(id, async bd => {
      const listeTableaux = await bd
        .iterator({ limit: -1 })
        .collect()
        .map((e: { [key: string]: any }) => e.payload.value);
      f(listeTableaux);
    });
  }

  async créerTableau(): Promise<string> {
    const idBdTableau = await this.client.créerBDIndépendante("kvstore");
    return idBdTableau;
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
    await bdNoms.set(langue, nom)
  }

  async effacerNomTableau(id: string, langue: string) {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    const bdNoms = await this.client.ouvrirBD(idBdNoms);
    await bdNoms.del(langue)
  }

  async suivreNomsTableau(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDic(id, "noms", f);
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
