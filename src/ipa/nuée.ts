import ClientConstellation from "./client";
import hyperswarm from "hyperswarm-web";
import crypto from "crypto";
const décodeur = new TextDecoder("utf-8");

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

export default class Nuée {
  client: ClientConstellation;
  sujet: Buffer;
  nuée: any;

  constructor(client: ClientConstellation) {
    this.client = client;

    this.sujet = crypto
      .createHash("sha256")
      .update("réseau-constellation")
      .digest();
    this.nuée = hyperswarm();
    this.nuée.join(this.sujet, { lookup: true, announce: true });
    window.client = this.client;
    this.nuée.on("connection", async (prise: any) => {
      prise.on("data", (données: BufferSource) =>
        this.gérerDonnées(données, prise)
      );
      setInterval(
        () => this.direSalut(prise),
        1000 * 60
      );
      this.direSalut(prise);
    });
  }

  async direSalut(prise: any): Promise<void> {
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

  async gérerDonnées(données: BufferSource, prise: any): Promise<void> {
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
