import { v4 as uuidv4 } from "uuid";
import { EventEmitter, once } from "events";
import _Vue from "vue";
import { schémaFonctionSuivi, schémaFonctionOublier } from "@/ipa/client";

interface Tâche {
  id: string;
  fSuivre: schémaFonctionSuivi<any>;
  fOublier: schémaFonctionOublier;
}

export interface MessageDeTravailleur {
  type: "prêt" | "suivre" | "suivrePrêt" | "action";
}

export interface MessagePrêtDeTravailleur extends MessageDeTravailleur {
  type: "prêt";
}

export interface MessageSuivreDeTravailleur extends MessageDeTravailleur {
  type: "suivre";
  id: string;
  données: unknown;
}

export interface MessageSuivrePrêtDeTravailleur extends MessageDeTravailleur {
  type: "suivrePrêt";
  id: string;
}

export interface MessageActionDeTravailleur extends MessageDeTravailleur {
  type: "action";
  id: string;
  résultat: unknown;
}

export interface MessagePourTravailleur {
  type: "oublier" | "suivre" | "action" | "init";
}

export interface MessageInitPourTravailleur extends MessagePourTravailleur {
  type: "init";
  idBdRacine?: string;
}

export interface MessageSuivrePourTravailleur extends MessagePourTravailleur {
  type: "suivre";
  id: string;
  fonction: string[];
  args: any[];
  iArgFonction: number;
}

export interface MessageActionPourTravailleur extends MessagePourTravailleur {
  type: "action";
  id: string;
  fonction: string[];
  args: any[];
}

export interface MessageOublierPourTravailleur extends MessagePourTravailleur {
  type: "oublier";
  id: string;
}

class Callable extends Function {
  _bound: Callable;

  // https://replit.com/@arccoza/Javascript-Callable-Object-using-bind?ref=hackernoon.com
  constructor() {
    // We create a new Function object using `super`, with a `this` reference
    // to itself (the Function object) provided by binding it to `this`,
    // then returning the bound Function object (which is a wrapper around the
    // the original `this`/Function object). We then also have to store
    // a reference to the bound Function object, as `_bound` on the unbound `this`,
    // so the bound function has access to the new bound object.
    // Pro: Works well, doesn't rely on deprecated features.
    // Con: A little convoluted, and requires wrapping `this` in a bound object.

    super("...args", "return this._bound.__call__(...args)");
    // Or without the spread/rest operator:
    // super('return this._bound._call.apply(this._bound, arguments)')
    this._bound = this.bind(this);

    return this._bound;
  }
}

class IPAParallèle extends Callable {
  événements: EventEmitter;
  travailleur: Worker;
  tâches: { [key: string]: Tâche };
  ipaPrêt: boolean;
  messagesEnAttente: MessagePourTravailleur[];
  erreurs: (Error | ErrorEvent)[];

  constructor() {
    super();
    console.log("Constructeur IPA parallèl");
    this.événements = new EventEmitter();
    this.tâches = {};
    this.ipaPrêt = false;
    this.messagesEnAttente = [];
    this.erreurs = [];

    this.travailleur = new Worker(new URL("./travailleur.ts", import.meta.url));
    this.travailleur.onerror = (e) => {
      this.erreur(e);
    };
    this.travailleur.onmessage = (e: MessageEvent<MessageDeTravailleur>) => {
      console.log("message du travailleur", e.data);
      const { type } = e.data;
      switch (type) {
        case "prêt": {
          this.ipaActivé();
          break;
        }
        case "suivre": {
          const { id, données } = e.data as MessageSuivreDeTravailleur;
          const { fSuivre } = this.tâches[id];
          fSuivre(données);
          break;
        }
        case "suivrePrêt": {
          const { id } = e.data as MessageSuivrePrêtDeTravailleur;
          this.événements.emit(id);
          break;
        }
        case "action": {
          const { id, résultat } = e.data as MessageActionDeTravailleur;
          this.événements.emit(id, résultat);
          break;
        }
        default: {
          this.erreur(
            new Error(`Type inconnu ${type} dans message ${e.data}.`)
          );
        }
      }
    };
    const idBdRacine = localStorage.getItem("idBdRacine") || undefined;
    const messageInit: MessageInitPourTravailleur = {
      type: "init",
      idBdRacine,
    };
    this.travailleur.postMessage(messageInit);
  }

  __call__(fonction: string[], listeArgs: any[]): Promise<unknown> {
    const id = uuidv4();
    const iArgFonction = listeArgs.findIndex((a) => typeof a === "function");

    if (iArgFonction !== -1) {
      return this.appelerFonctionSuivre(id, fonction, listeArgs, iArgFonction);
    } else {
      return this.appelerFonctionAction(id, fonction, listeArgs);
    }
  }

  async appelerFonctionSuivre(
    id: string,
    fonction: string[],
    listeArgs: unknown[],
    iArgFonction: number
  ) {
    const f = listeArgs[iArgFonction] as schémaFonctionSuivi<any>;
    const args = listeArgs.filter((a) => typeof a !== "function");
    if (args.length !== listeArgs.length - 1) {
      this.erreur(new Error("Plus d'un argument est une fonction."));
      return new Promise((_resolve, reject) => reject());
    }

    const message: MessageSuivrePourTravailleur = {
      type: "suivre",
      id,
      fonction,
      args,
      iArgFonction,
    };

    const messageOublier: MessageOublierPourTravailleur = {
      type: "oublier",
      id,
    };
    const fOublier = () => {
      this.travailleur.postMessage(messageOublier);
    };
    const tâche: Tâche = {
      id,
      fSuivre: f,
      fOublier,
    };
    this.tâches[id] = tâche;

    const fOublierTâche = () => {
      this.oublierTâche(id);
    };

    this.envoyerMessage(message);

    await once(this.événements, id);
    return fOublierTâche;
  }

  async appelerFonctionAction(
    id: string,
    fonction: string[],
    listeArgs: unknown[]
  ): Promise<unknown> {
    const message: MessageActionPourTravailleur = {
      type: "action",
      id,
      fonction,
      args: listeArgs,
    };
    this.envoyerMessage(message);

    const événements = this.événements;
    const résultat = await once(événements, id);
    console.log("appelerFonctionAction", { résultat });
    return résultat;
  }

  ipaActivé(): void {
    this.messagesEnAttente.forEach((m) => this.travailleur.postMessage(m));
    console.log("messages en attente envoyés: ", [...this.messagesEnAttente]);
    this.messagesEnAttente = [];
    this.ipaPrêt = true;
  }

  envoyerMessage(message: MessagePourTravailleur): void {
    console.log("envoyerMessage", { message });
    if (this.ipaPrêt) {
      console.log("message envoyé", { message });
      this.travailleur.postMessage(message);
    } else {
      this.messagesEnAttente.push(message);
    }
  }

  erreur(e: ErrorEvent | Error): void {
    this.erreurs.push(e);
    this.événements.emit("erreur", this.erreurs);
    console.error(e);
  }

  oublierTâche(id: string): void {
    const tâche = this.tâches[id];
    if (tâche) tâche.fOublier();
    delete this.tâches[id];
  }
}

class Handler {
  listeAtributs: string[];

  constructor(listeAtributs?: string[]) {
    this.listeAtributs = listeAtributs || [];
  }

  get(obj: IPAParallèle, prop: string): any {
    const directes = ["événements", "erreur"];
    if (directes.includes(prop)) {
      return obj[prop as keyof IPAParallèle];
    } else {
      const listeAtributs = [...this.listeAtributs, prop];
      const h = new Handler(listeAtributs);
      return new Proxy(obj, h);
    }
  }

  apply(target: IPAParallèle, _thisArg: Handler, argumentsList: unknown[]) {
    return target.__call__(this.listeAtributs, argumentsList);
  }
}

export default {
  install(Vue: typeof _Vue): void {
    const handler = new Handler();
    const ipa = new IPAParallèle();
    Vue.prototype.$ipa = new Proxy<IPAParallèle>(ipa, handler);
    //@ts-ignore
    window.ipa = Vue.prototype.$ipa;
  },
};
