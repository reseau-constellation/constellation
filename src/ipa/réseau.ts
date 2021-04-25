import { v4 as uuidv4 } from "uuid";
import ClientConstellation, {
  schémaFonctionSuivi,
  schémaFonctionOublier
} from "./client";

export default class Réseau {
  client: ClientConstellation;

  constructor(client: ClientConstellation, id: string) {
    this.client = client;
    this.idBD = id;
  }

  async ajouterMembre(id: string): Promise<void> {
    const existante = await this.client.rechercherBdListe(
      this.idBD,
      e => e.payload.value.id === id
    )
    if (!id) {
      const bdRacine = await this.client.ouvrirBD(this.idBd)
      const élément = {
        id: id
      }
      await bdRacine.add(élément)
    }
  }

  async suivreMembres(
    f: schémaFonctionSuivi
  ): Promise<schémaFonctionOublier> {
    return await this.client.suivreBdListe(this.idBD, f);
  }
}
