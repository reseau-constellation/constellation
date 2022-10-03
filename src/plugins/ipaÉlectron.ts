import _Vue from "vue";
import { client, proxy } from "@constl/ipa";

declare global {
  interface Window {
    ipa: {
      receive: (
        canal: string,
        f: (m: proxy.messages.MessageDeTravailleur) => void
      ) => void;
      send: (
        canal: string,
        m:
          | proxy.messages.MessagePourTravailleur
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
      (m: proxy.messages.MessageDeTravailleur) => {
        console.log(`Message reçu du processus principal`, m);
        this.événements.emit("message", m);
      }
    );

    window.ipa.send("àPrincipal:constellation", { type: "init", opts });
  }

  envoyerMessage(message: proxy.messages.MessagePourTravailleur): void {
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
