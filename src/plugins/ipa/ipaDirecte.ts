import { téléClient, MessageDeTravailleur, MessagePourTravailleur } from "./ipaParallèle";
import GestionnaireClient from "./gestionnaireClient";

export default class IPADirecte extends téléClient {
  client: GestionnaireClient;

  constructor() {
    super();

    this.client = new GestionnaireClient(
      (e: MessageDeTravailleur) => this.emit("message", e),
      (e: Error) => this.emit("erreur", e)
    );
  }

  recevoirMessage(message: MessagePourTravailleur) {
    this.client.gérerMessage(message)
  }
}
