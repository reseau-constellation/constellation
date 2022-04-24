import { BrowserWindow, ipcMain, app } from "electron";
import path from "path";

import { proxy } from "@constl/ipa";

let client: proxy.gestionnaireClient.default;


export default (win: BrowserWindow): (() => Promise<void>) => {
  console.log("initConstellation");
  const fMessage = (m: proxy.messages.MessageDeTravailleur) => {
    console.log("Message de travailleur", m);
    win.webContents.send("fromMain", m);
  };
  const fErreur = (e: Error) => {
    console.log("Message erreur", e);
    const messageErreur: proxy.messages.MessageErreurDeTravailleur = {
      type: "erreur",
      erreur: e,
    };
    win.webContents.send("fromMain", messageErreur);
  };

  ipcMain.on("toMain", (_event, message) => {
    console.log("Message pour travailleur", message);
    if (!client) {
      if (message.type === "init") {
        client = new proxy.gestionnaireClient.default(
          fMessage,
          fErreur,
          Object.assign(
            message.opts,
            {
              orbite: {
                sfip: {
                  dossier: path.join(app.getPath("userData"), "sfip")
                },
                dossier: path.join(app.getPath("userData"), "sfip")
              }
            }
          )
        );
      } else {
        throw Error("Client non initialisé");
      }
    } else {
      if (message.type === "init") {
        win.webContents.send("fromMain", { type: "prêt" })
      } else {
        client.gérerMessage(message);
      }
    }
  });

  return async () => {
    await client.fermer();
  };
};
