import { BrowserWindow, ipcMain, app } from "electron";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { client, proxy } from "@constl/ipa";

const enDéveloppement = process.env.NODE_ENV !== "production";

let clientConstellation: proxy.gestionnaireClient.default | undefined =
  undefined;

class Fenêtres {
  fenêtres: { [key: string]: BrowserWindow };

  constructor() {
    this.fenêtres = {};
  }

  connecterFenêtre(fenêtre: BrowserWindow, id: string): string {
    this.fenêtres[id] = fenêtre;
    return id;
  }

  déconnecterFenêtre(idFenêtre: string): void {
    console.log("déconnecterFenêtre");
    delete this.fenêtres[idFenêtre];
  }

  envoyerMessage(m: proxy.messages.MessageDeTravailleur) {
    console.log("envoyerMessage", { m });
    if (m.id) {
      const idFenêtre = m.id.split(":")[0];
      m.id = m.id.split(":").slice(1).join(":");

      const fenêtre = this.fenêtres[idFenêtre];
      fenêtre.webContents.send("dePrincipal:constellation", m);
    } else {
      Object.values(this.fenêtres).forEach((f) =>
        f.webContents.send("dePrincipal:constellation", m)
      );
    }
  }

  envoyerErreur(e: Error) {
    console.log("Message erreur", e);
    const messageErreur: proxy.messages.MessageErreurDeTravailleur = {
      type: "erreur",
      erreur: e,
    };
    Object.values(this.fenêtres).forEach((f) =>
      f.webContents.send("dePrincipal:constellation", messageErreur)
    );
  }
}

const fenêtres = new Fenêtres();

export const fermerConstellation = async () => {
  console.log("fermerConstellation");
  if (clientConstellation) await clientConstellation.fermer();
  clientConstellation = undefined;
};

export const connecterFenêtreÀConstellation = (
  fenêtre: BrowserWindow
): (() => void) => {
  const id = uuidv4();
  fenêtres.connecterFenêtre(fenêtre, id);

  const fSuivreIPCPrincipal = (
    _event: Event,
    message:
      | proxy.messages.MessagePourTravailleur
      | {
          type: "init";
          opts: client.optsConstellation;
        }
  ) => {
    console.log("Message pour travailleur", message);

    if (!clientConstellation) {
      if (message.type === "init") {
        clientConstellation = new proxy.gestionnaireClient.default(
          (m: proxy.messages.MessageDeTravailleur) =>
            fenêtres.envoyerMessage(m),
          (e: Error) => fenêtres.envoyerErreur(e),
          Object.assign(message.opts, {
            orbite: {
              sfip: {
                dossier: path.join(app.getPath("userData"),  enDéveloppement ? path.join("dév", "sfip") : "sfip"),
              },
              dossier: path.join(app.getPath("userData"), enDéveloppement ? path.join("dév", "orbite") : "orbite"),
            },
          })
        );
      } else {
        throw Error("Client non initialisé");
      }
    } else {
      if (message.type !== "init") {
        if (message.id) message.id = id + ":" + message.id;
        console.log("nouveauMessage", { message });
        clientConstellation.gérerMessage(message);
      }
    }
  };
  ipcMain.on("àPrincipal:constellation", fSuivreIPCPrincipal);

  return () => {
    ipcMain.off("àPrincipal:constellation", fSuivreIPCPrincipal);
    fenêtres.déconnecterFenêtre(id);
  };
};
