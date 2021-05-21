import ClientConstellation, { schémaFonctionSuivi } from "./client";

const MAX_TAILLE_IMAGE = 500;

export default class Compte {
  client: ClientConstellation;
  idBd: string;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBd = id;
  }

  async suivreCourriel(f: schémaFonctionSuivi, idBdRacine?: string) {
    idBdRacine = idBdRacine || this.idBd;
    return await this.client.suivreBd(idBdRacine, async (bd) => {
      const courriel = await bd.get("courriel");
      f(courriel);
    });
  }

  async sauvegarderCourriel(courriel: string): Promise<void> {
    const bd = await this.client.ouvrirBD(this.idBd);
    await bd.set("courriel", courriel);
  }

  async suivreNoms(f: schémaFonctionSuivi, idBdRacine?: string) {
    idBdRacine = idBdRacine || this.idBd;
    return await this.client.suivreBdDicDeClef(idBdRacine, "noms", f);
  }

  async sauvegarderNom(langue: string, nom: string): Promise<void> {
    const idBdNoms = await this.client.obtIdBd("noms", this.idBd, "kvstore");
    if (!idBdNoms)
      throw `Permission de modification refusée pour BD ${this.idBd}.`;

    const bd = await this.client.ouvrirBD(idBdNoms);
    await bd.set(langue, nom);
  }

  async effacerNom(langue: string): Promise<void> {
    const idBdNoms = await this.client.obtIdBd("noms", this.idBd);
    if (!idBdNoms)
      throw `Permission de modification refusée pour BD ${this.idBd}.`;

    const bd = await this.client.ouvrirBD(idBdNoms);
    await bd.del(langue);
  }

  async sauvegarderImage(image: File): Promise<void> {
    const octets = await image.arrayBuffer();
    const idImage = await this.client.ajouterÀSFIP(octets);
    const bd = await this.client.ouvrirBD(this.idBd);
    await bd.set("image", idImage);
  }

  async effacerImage(): Promise<void> {
    const bd = await this.client.ouvrirBD(this.idBd);
    await bd.del("image");
  }

  async suivreImage(f: schémaFonctionSuivi, idBdRacine?: string) {
    idBdRacine = idBdRacine || this.idBd;
    return await this.client.suivreBd(idBdRacine, async (bd) => {
      const idImage = await bd.get("image");
      if (!idImage) return f(null);
      const image = await this.client.obtFichierSFIP(idImage, MAX_TAILLE_IMAGE);
      f(image);
    });
  }
}
