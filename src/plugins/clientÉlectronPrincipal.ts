import générerProxy, {
  téléClient,
  MessageDeTravailleur,
  MessagePourTravailleur,
  ProxyClientConstellation,
} from "@constl/ipa/lib/proxy/proxy";

declare global {
  interface Window {
    ipa: {
      receive: (canal: string, f: (m: MessageDeTravailleur) => void) => void;
      send: (canal: string, m: MessagePourTravailleur) => void;
    };
  }
}

export class IPAÉlectronPrincipal extends téléClient {
  constructor() {
    super();

    window.ipa.receive("fromMain", (m: MessageDeTravailleur) => {
      console.log(`Received ${m} from main process`);
      this.emit("message", m);
    });
  }

  recevoirMessage(message: MessagePourTravailleur): void {
    window.ipa.send("toMain", message);
  }
}

export default (
  idBdRacine?: string,
  sujetRéseau?: string
): ProxyClientConstellation => {
  return générerProxy(
    new IPAÉlectronPrincipal(),
    false,
    idBdRacine,
    undefined,
    sujetRéseau
  );
};
