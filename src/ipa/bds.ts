import { FeedStore, KeyValueStore } from "orbit-db";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier,
} from "./client";

export default class BDs {
  client: ClientConstellation;
  idBd: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;
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

    const idBdNoms = await this.client.créerBdIndépendante("kvstore");
    await bdBD.set("noms", idBdNoms);

    const idBdDescr = await this.client.créerBdIndépendante("kvstore");
    await bdBD.set("descriptions", idBdDescr);

    const idBdTableaux = await this.client.créerBdIndépendante("feed");
    await bdBD.set("tableaux", idBdTableaux);

    const idBdMotsClefs = await this.client.créerBdIndépendante("feed");
    await bdBD.set("motsClefs", idBdMotsClefs);

    return idBdBD;
  }

  async ajouterNomsBd(
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

  async sauvegarderNomBD(
    id: string,
    langue: string,
    nom: string
  ): Promise<void> {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    await bdNoms.set(langue, nom);
  }

  async effacerNomBD(id: string, langue: string): Promise<void> {
    const idBdNoms = await this.client.obtIdBd("noms", id, "kvstore");
    if (!idBdNoms) throw `Permission de modification refusée pour BD ${id}.`;

    const bdNoms = (await this.client.ouvrirBd(idBdNoms)) as KeyValueStore;
    await bdNoms.del(langue);
  }

  async ajouterDescriptionsBD(
    id: string,
    descriptions: { [key: string]: string }
  ): Promise<void> {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    if (!idBdDescr) throw `Permission de modification refusée pour BD ${id}.`;

    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    for (const lng in descriptions) {
      await bdDescr.set(lng, descriptions[lng]);
    }
  }

  async sauvegarderDescrBD(
    id: string,
    langue: string,
    nom: string
  ): Promise<void> {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    if (!idBdDescr) throw `Permission de modification refusée pour BD ${id}.`;

    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    await bdDescr.set(langue, nom);
  }

  async effacerbdDescrBD(id: string, langue: string): Promise<void> {
    const idBdDescr = await this.client.obtIdBd("descriptions", id, "kvstore");
    if (!idBdDescr) throw `Permission de modification refusée pour BD ${id}.`;

    const bdDescr = (await this.client.ouvrirBd(idBdDescr)) as KeyValueStore;
    await bdDescr.del(langue);
  }

  async ajouterTableauBD(id: string): Promise<string> {
    const idBdTableaux = await this.client.obtIdBd("tableaux", id, "feed");
    if (!idBdTableaux)
      throw `Permission de modification refusée pour BD ${id}.`;

    const bdTableaux = (await this.client.ouvrirBd(idBdTableaux)) as FeedStore;
    const idTableau = await this.client.tableaux!.créerTableau();
    await bdTableaux.add(idTableau);
    return idTableau;
  }

  async effacerTableauBD(id: string, idTableau: string): Promise<void> {
    // Dabord effacer l'entrée dans notre liste de tableaux
    const idBdTableaux = await this.client.obtIdBd("tableaux", id);
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

  async suivreLicence(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBd(id, async (bd) => {
      const licence = await bd.get("licence");
      f(licence);
    });
  }

  async suivreNomsBD(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef(id, "noms", f);
  }

  async suivreDescrBD(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdDicDeClef(id, "descriptions", f);
  }

  async suivreTableauxBD(
    id: string,
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListeDeClef(id, "tableaux", f);
  }

  async suivreScoreBD(
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

  async effacerBD(id: string): Promise<void> {
    // Dabord effacer l'entrée dans notre liste de BDs
    const bdRacine = (await this.client.ouvrirBd(this.idBd)) as FeedStore;
    const entrée = bdRacine
      .iterator({ limit: -1 })
      .collect()
      .find((e: { [key: string]: any }) => e.payload.value === id);
    await bdRacine.remove(entrée.hash);

    // Et puis maintenant aussi effacer les données et la BD elle-même
    for (const clef in ["noms", "descriptions", "motsClefs"]) {
      const idBd = await this.client.obtIdBd(clef, id);
      if (idBd) await this.client.effacerBD(idBd);
    }
    const idBdTableaux = await this.client.obtIdBd("tableaux", id);
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
    await this.client.effacerBD(id);
  }
}
