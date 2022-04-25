import { client, proxy } from "@constl/ipa";

const générerProxy = proxy.proxy.default;
const { téléClient } = proxy.proxy;

const GestionnaireClient = proxy.gestionnaireClient.default;

declare global {
  interface Window {
    ipa: {
      receive: (
        canal: string,
        f: (m: proxy.messages.MessageDeTravailleur) => void
      ) => void;
      send: (canal: string, m: proxy.messages.MessagePourTravailleur) => void;
    };
  }
}

export class IPAÉlectronPrincipal extends téléClient {
  constructor(opts: client.optsConstellation = {}) {
    super();
    /*
    this.client = new GestionnaireClient(
      (e: proxy.messages.MessageDeTravailleur) => {
        this.emit("message", e);
      },
      (erreur: Error, id?: string) => {
        const messageErreur: proxy.messages.MessageErreurDeTravailleur = {
          type: "erreur",
          id,
          erreur,
        };
        this.emit("erreur", messageErreur);
      },
      opts
    );
    */

    window.ipa.receive("fromMain", (m: proxy.messages.MessageDeTravailleur) => {
      console.log(`Received ${m} from main process`);
      // this.recevoirMessage(m);
      this.emit("message", m);
    });
  }

  recevoirMessage(message: proxy.messages.MessagePourTravailleur): void {
    // this.client.gérerMessage(message);
    window.ipa.send("toMain", message);
  }
}

export default (
  opts?: client.optsConstellation
): proxy.proxy.ProxyClientConstellation => {
  return générerProxy(new IPAÉlectronPrincipal(opts), false);
};
