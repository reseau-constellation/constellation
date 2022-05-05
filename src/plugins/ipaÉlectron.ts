import _Vue from "vue";
import { client, proxy } from "@constl/ipa";
import {
  MessagePourTravailleur,
  MessageDeTravailleur,
} from "@/électron/messages";

declare global {
  interface Window {
    ipa: {
      receive: (canal: string, f: (m: MessageDeTravailleur) => void) => void;
      send: (
        canal: string,
        m:
          | MessagePourTravailleur
          | { type: "init"; opts: client.optsConstellation }
          | any
      ) => void;
    };
  }
}

export class ProxyClientÉlectronPrincipal extends proxy.proxy
  .ClientProxifiable {
  constructor(opts: client.optsConstellation = {}, souleverErreurs = false) {
    super(souleverErreurs);
    console.log("IPAÉlectronPrincipal");

    window.ipa.receive(
      "dePrincipal:constellation",
      (m: MessageDeTravailleur) => {
        console.log(`Message ${m} reçu du processus principal`);
        this.événements.emit("message", m);
      }
    );

    window.ipa.send("àPrincipal:constellation", { type: "init", opts });
  }

  envoyerMessage(message: MessagePourTravailleur): void {
    console.log("IPAÉlectronPrincipal àPrincipal:constellation", message);
    window.ipa.send("àPrincipal:constellation", message);
  }
}

export default {
  install(Vue: typeof _Vue): void {
    const idBdCompte = localStorage.getItem("idBdCompte") || undefined;
    const opts: client.optsConstellation = {
      compte: idBdCompte,
    };
    const ipa = proxy.proxy.générerProxy(
      new ProxyClientÉlectronPrincipal(opts, false)
    );
    Vue.prototype.$ipa = ipa;
  },
};
