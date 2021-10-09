import { BrowserWindow, ipcMain } from "electron";

import GestionnaireClient from "@constl/ipa/lib/proxy/gestionnaireClient";
import {
  MessageDeTravailleur,
  MessageErreurDeTravailleur,
} from "@constl/ipa/lib/proxy/proxy";

export default (win: BrowserWindow): (() => Promise<void>) => {
  const client = new GestionnaireClient(
    (m: MessageDeTravailleur) => {
      win.webContents.send("message", m);
    },
    (e: Error) => {
      const messageErreur: MessageErreurDeTravailleur = {
        type: "erreur",
        erreur: e,
      };
      win.webContents.send("erreur", messageErreur);
    }
  );

  ipcMain.on("toMain", (_event, message) => {
    client.gérerMessage(message);
  });

  return async () => {
    console.error("À faire : fermer le client");
    // await client.fermer()
  };
};
