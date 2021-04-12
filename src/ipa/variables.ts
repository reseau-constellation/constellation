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

  async ajouterDescriptionsVariable(
    id: string,
    descriptions: { [key: string]: string }
  ) {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    const bdDescr = await this.client.ouvrirBD(idBdDescr);
    for (const lng in descriptions) {
      await bdDescr.set(lng, descriptions[lng]);
    }
  }

  async sauvegarderDescrVariable(id: string, langue: string, nom: string) {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    const bdDescr = await this.client.ouvrirBD(idBdDescr);
    await bdDescr.set(langue, nom);
  }

  async effacerbdDescrVariable(id: string, langue: string) {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    const bdDescr = await this.client.ouvrirBD(idBdDescr);
    await bdDescr.del(langue);
  }

  async suivreNomsVariable(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDic(id, "noms", f);
  }

  async suivreDescrVariable(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDic(id, "descriptions", f);
  }


  async effacerVariable(id: string) {
    // Effacer l'entrée dans notre liste de variables
    const bdRacine = await this.client.ouvrirBD(this.idBD);
    const entrée = (await bdRacine.iterator({ limit: -1 }).collect()).find(
      (e: { [key: string]: any }) => e.payload.value === id
    );
    await bdRacine.remove(entrée.hash);

  }
}
