import { v4 as uuidv4 } from "uuid";
import { isValidAddress } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier
} from "./client";

export default class Variables {
  client: ClientConstellation;
  idBD: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBD = id;
  }

  async suivreVariables(
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListe(this.idBD, f);
  }

  async créerVariable(): Promise<string> {
    const bdRacine = await this.client.ouvrirBD(this.idBD);
    const idBdVariable = await this.client.créerBDIndépendante("kvstore");
    await bdRacine.add(idBdVariable);

    const bdVariable = await this.client.ouvrirBD(idBdVariable);
    const idBdNoms = await this.client.créerBDIndépendante("kvstore");
    await bdVariable.set("noms", idBdNoms);

    return idBdVariable;
  }

  async ajouterNomsVariable(id: string, noms: { [key: string]: string }) {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    const bdNoms = await this.client.ouvrirBD(idBdNoms);
    for (const lng in noms) {
      await bdNoms.set(lng, noms[lng]);
    }
  }

  async sauvegarderNomVariable(id: string, langue: string, nom: string) {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    const bdNoms = await this.client.ouvrirBD(idBdNoms);
    await bdNoms.set(langue, nom);
  }

  async effacerNomVariable(id: string, langue: string) {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    const bdNoms = await this.client.ouvrirBD(idBdNoms);
    await bdNoms.del(langue);
  }

  async suivreNomsVariable(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDic(id, "noms", f);
  }
}
