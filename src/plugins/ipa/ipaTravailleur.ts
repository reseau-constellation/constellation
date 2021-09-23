import { téléClient, MessageDeTravailleur, MessagePourTravailleur } from "./ipaParallèle";

export default class IPATravailleur extends téléClient {
  travailleur: Worker;

  constructor() {
    super();

    this.travailleur = new Worker(new URL("./travailleur.ts", import.meta.url));
    this.travailleur.onerror = (e) => {
      this.emit("erreur", e);
    };
    this.travailleur.onmessage = (e: MessageEvent<MessageDeTravailleur>) => {
      this.emit("message", e);
    }
  }

  recevoirMessage(message: MessagePourTravailleur): void {
    this.travailleur.postMessage(message);
  }
}
