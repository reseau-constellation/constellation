import { BrowserWindow, ipcMain } from "electron";

import { proxy } from "@constl/ipa";

export default (win: BrowserWindow): (() => Promise<void>) => {
  const client = new proxy.gestionnaireClient.default(
    (m: proxy.messages.MessageDeTravailleur) => {
      win.webContents.send("message", m);
    },
    (e: Error) => {
      const messageErreur: proxy.messages.MessageErreurDeTravailleur = {
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
