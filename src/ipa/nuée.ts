import ClientConstellation from "./client";
import hyperswarm from "hyperswarm-web";
import crypto from "crypto";
import { isValidAddress } from "orbit-db";
const décodeur = new TextDecoder("utf-8");

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

    this.nuée.on("connection", (prise: any) => {
      prise.on("data", (données: BufferSource) =>
        this.gérerDonnées(données, prise)
      );
      const message = {
        type: "Salut !",
        contenu: {
          id: this.client.idNodeSFIP!.id,
          racine: this.client._bdRacine.id
        }
      };
      prise.write(JSON.stringify(message));
    });
  }

  gérerDonnées(données: BufferSource, prise: any) {
    const message = JSON.parse(décodeur.decode(données));
    console.log(message);
    switch (message.type) {
      case "Salut !":
        if (isValidAddress(message.contenu.racine)) {
          this.client.réseau.ajouterMembre(message.contenu.racine)
        }
        // this.client.connecterPoste(message.contenu.id, message.contenu.racine);
    }
  }
}
