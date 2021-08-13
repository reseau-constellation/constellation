import EventEmitter from "events";
import hyperswarm from "hyperswarm-web";
import crypto from "crypto";
const décodeur = new TextDecoder("utf-8");

import ClientConstellation, { schémaFonctionOublier } from "./client";

interface Message {
  signature: Signature;
  valeur: ValeurMessage;
}

export interface Signature {
  signature: string;
  clefPublique: string;
}

interface ValeurMessage {
  type: string;
  contenu: ContenuMessage;
}

interface ContenuMessage {
  [key: string]: unknown;
}

interface infoPrise {
  prise: Prise;
  fOublier: schémaFonctionOublier;
}
interface ValeurMessageSalut extends ValeurMessage {
  type: "Salut !";
  contenu: ContenuMessageSalut;
}

interface ContenuMessageSalut extends ContenuMessage {
  idSFIP: string;
  idOrbite: string;
  idBdRacine: string;
  clefPublique: string;
  signatures: { id: string; publicKey: string };
}

interface Prise extends EventEmitter {
  _id: string;
  writable: boolean;
  write: (x: string) => void;
}

interface HyperSwarm extends EventEmitter {
  join: (sujet: Buffer, ops: { lookup: boolean; announce: boolean }) => void;
}

export default class Nuée {
  client: ClientConstellation;
  sujet: Buffer;
  nuée: HyperSwarm;
  prises: { [key: string]: infoPrise };

  constructor(client: ClientConstellation) {
    this.client = client;
    this.prises = {};
    setInterval(() => this.direSalutÀTous(), 1000 * 60);

    this.sujet = crypto
      .createHash("sha256")
      .update("réseau-constellation")
      .digest();
    this.nuée = hyperswarm();
    this.nuée.join(this.sujet, { lookup: true, announce: true });

    this.nuée.on("connection", async (prise: Prise) => {
      const fGérerDonnées = (données: BufferSource) =>
        this.gérerDonnées(données, prise);
      prise.on("data", fGérerDonnées);
      const fOublier = () => {
        prise.off("data", fGérerDonnées);
      };
      this.prises[prise._id] = { prise, fOublier };
      this.direSalut(prise);
    });
  }

  async direSalutÀTous(): Promise<void> {
    await Promise.all(
      Object.values(this.prises).map((p) => {
        if (p.prise.writable) this.direSalut(p.prise);
        else {
          p.fOublier();
          delete this.prises[p.prise._id];
        }
      })
    );
  }

  async direSalut(prise: Prise): Promise<void> {
    const valeur: ValeurMessageSalut = {
      type: "Salut !",
      contenu: {
        idSFIP: this.client.idNodeSFIP!.id,
        idOrbite: this.client.orbite!.identity.id,
        clefPublique: this.client.orbite!.identity.publicKey,
        signatures: this.client.orbite!.identity.signatures,
        idBdRacine: this.client.bdRacine!.id,
      },
    };
    const signature = await this.client.signer(JSON.stringify(valeur));
    const message: Message = {
      signature,
      valeur,
    };

    prise.write(JSON.stringify(message));
  }

  async gérerDonnées(données: BufferSource, prise: Prise): Promise<void> {
    const message: Message = JSON.parse(décodeur.decode(données));
    const { valeur, signature } = message;

    // Assurer que la signature est valide (message envoyé par détenteur de idOrbite)
    const signatureValide = await this.client.vérifierSignature(
      signature,
      JSON.stringify(valeur)
    );
    if (!signatureValide) return;
    switch (valeur.type) {
      case "Salut !": {
        const contenu = valeur.contenu as ContenuMessageSalut;
        const { clefPublique } = contenu;

        // S'assurer que idOrbite est la même que celle sur la signature
        if (clefPublique !== signature.clefPublique) return;
        this.client.réseau!.ajouterMembre(contenu);
      }
    }
  }
}
