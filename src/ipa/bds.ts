import { isValidAddress } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier
} from "./client";

export default class BDs {
  client: ClientConstellation;
  idBD: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBD = id;
  }

  async suivreBDs(f: schémaFonctionSuivi): Promise<schémaFonctionOublier> {
    return await this.client.suivreBD(this.idBD, async bd => {
      const listeBDs = bd
        .iterator({ limit: -1 })
        .collect()
        .map((e: { [key: string]: any }) => e.payload.value);
      f(listeBDs);
    });
  }

  async créerBD(licence: string): Promise<string> {
    const bdRacine = await this.client.ouvrirBD(this.idBD);
    const idBdBD = await this.client.créerBDIndépendante("kvstore");
    await bdRacine.add(idBdBD);

    const bdBD = await this.client.ouvrirBD(idBdBD);
    await bdBD.set("licence", licence);

    const idBdNoms = await this.client.créerBDIndépendante("kvstore");
    await bdBD.set("noms", idBdNoms);

    const idBdDescr = await this.client.créerBDIndépendante("kvstore");
    await bdBD.set("descriptions", idBdDescr);

    const idBdTableaux = await this.client.créerBDIndépendante("feed");
    await bdBD.set("tableaux", idBdTableaux);

    const idBdMotsClefs = await this.client.créerBDIndépendante("feed");
    await bdBD.set("motsClefs", idBdMotsClefs);

    return idBdBD;
  }

  async ajouterNomsBD(id: string, noms: { [key: string]: string }) {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    const bdNoms = await this.client.ouvrirBD(idBdNoms);
    for (const lng in noms) {
      await bdNoms.set(lng, noms[lng]);
    }
  }

  async sauvegarderNomBD(id: string, langue: string, nom: string) {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    const bdNoms = await this.client.ouvrirBD(idBdNoms);
    await bdNoms.set(langue, nom)
  }

  async effacerNomBD(id: string, langue: string) {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    const bdNoms = await this.client.ouvrirBD(idBdNoms);
    await bdNoms.del(langue)
  }

  async ajouterDescriptionsBD(
    id: string,
    descriptions: { [key: string]: string }
  ) {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    const bdDescr = await this.client.ouvrirBD(idBdDescr);
    for (const lng in descriptions) {
      await bdDescr.set(lng, descriptions[lng]);
    }
  }

  async sauvegarderDescrBD(id: string, langue: string, nom: string) {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    const bdDescr = await this.client.ouvrirBD(idBdDescr);
    await bdDescr.set(langue, nom)
  }

  async effacerbdDescrBD(id: string, langue: string) {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    const bdDescr = await this.client.ouvrirBD(idBdDescr);
    await bdDescr.del(langue)
  }

  async ajouterTableauBD(id: string): Promise<string> {
    const idBdTableaux = await this.client.obtIdBd("tableaux", id, "feed");
    const bdTableaux = await this.client.ouvrirBD(idBdTableaux);
    const idTableau = await this.client.tableaux!.créerTableau();
    await bdTableaux.add(idTableau);
    return idTableau;
  }

  async effacerTableauBD(id: string, idTableau: string): Promise<void> {
    // Dabord effacer l'entrée dans notre liste de tableaux
    const idBdTableaux = await this.client.obtIdBd("tableaux", id);
    const bdTableaux = await this.client.ouvrirBD(idBdTableaux);
    const entrée = (await bdTableaux.iterator({ limit: -1 }).collect()).find(
      (e: { [key: string]: any }) => e.payload.value === idTableau
    );
    await bdTableaux.remove(entrée.hash);

    // Enfin, effacer les données et le tableau lui-même
    await this.client.tableaux!.effacerTableau(idTableau);
  }

  async suivreLicence(id: string, f: schémaFonctionSuivi) {
    return await this.client.suivreBD(id, async bd => {
      const licence = await bd.get("licence");
      f(licence);
    });
  }

  async suivreNomsBD(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDic(id, "noms", f);
  }

  async suivreDescrBD(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDic(id, "descriptions", f);
  }

  async suivreTableauxBD(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    const idBdTableaux = await this.client.obtIdBd("tableaux", id, "feed");
    return await this.client.suivreBD(idBdTableaux, async bd => {
      const listeTableaux = bd
        .iterator({ limit: -1 })
        .collect()
        .map((e: { [key: string]: any }) => e.payload.value);
      f(listeTableaux);
    });
  }

  async effacerBD(id: string) {
    // Dabord effacer l'entrée dans notre liste de BDs
    const bdRacine = await this.client.ouvrirBD(this.idBD);
    const entrée = (await bdRacine.iterator({ limit: -1 }).collect()).find(
      (e: { [key: string]: any }) => e.payload.value === id
    );
    await bdRacine.remove(entrée.hash);

    // Et puis maintenant aussi effacer les données et la BD elle-même
    for (const clef in ["noms", "descriptions", "motsClefs"]) {
      const idBd = await this.client.obtIdBd(clef, id);
      if (idBd) await this.client.effacerBD(idBd);
    }
    const idBdTableaux = await this.client.obtIdBd("tableaux", id);
    if (idBdTableaux) {
      const bdTableaux = await this.client.ouvrirBD(idBdTableaux);
      const tableaux = await bdTableaux
        .iterator({ limit: -1 })
        .collect()
        .map((e: { [key: string]: any }) => e.payload.value);
      for (const t of tableaux) {
        await this.client.tableaux!.effacerTableau(t);
      }
    }
    await this.client.effacerBD(id);
  }
}
