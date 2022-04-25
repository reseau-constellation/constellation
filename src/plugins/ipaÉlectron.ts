import _Vue from "vue";
import { client } from "@constl/ipa";
import générerProxy, { téléClient } from "@/électron/proxy";
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
      ) => void;
    };
  }
}

export class IPAÉlectronPrincipal extends téléClient {
  constructor(opts: client.optsConstellation = {}) {
    super();
    console.log("IPAÉlectronPrincipal")

    window.ipa.receive("fromMain", (m: MessageDeTravailleur) => {
      console.log(`Received ${m} from main process`);
      this.emit("message", m);
    });

    window.ipa.send("toMain", { type: "init", opts });
  }

  recevoirMessage(message: MessagePourTravailleur): void {
    console.log("IPAÉlectronPrincipal toMain", message);
    window.ipa.send("toMain", message);
  }
}

export default {
  install(Vue: typeof _Vue): void {
    const idBdCompte = localStorage.getItem("idBdCompte") || undefined;
    const opts: client.optsConstellation = {
      compte: idBdCompte,
    };
    const ipa = générerProxy(new IPAÉlectronPrincipal(opts), false);
    Vue.prototype.$ipa = ipa;
    //@ts-ignore
    window.$ipa = ipa
  },
};
