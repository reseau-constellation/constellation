import { ipcMain } from "electron";

import { lancerServeur } from "@constl/serveur";

interface messageÀServeurLocal {
  type: "activer" | "désactiver"
}

interface messageActiverÀServeurLocal extends messageÀServeurLocal {
  type: "activer";
  portDésiré: number;
}


export default () => {
  let fermerServeur: (() => void) | undefined = undefined;
  let port: number | undefined = undefined;

  ipcMain.on("àPrincipal:serveurLocal", async (_event: Event, message: messageÀServeurLocal) => {
    const { type } = message;

    if (type === "activer") {
      const { portDésiré } = message as messageActiverÀServeurLocal
      if (fermerServeur) {
        if (port === portDésiré) {
          return;
        } else {
          fermerServeur();
        }
      }
      ({ fermerServeur, port } = await lancerServeur({ port: portDésiré, optsConstellation: {} }));
    } else if (type === "désactiver") {
      if (fermerServeur) {
        fermerServeur();
        fermerServeur = port = undefined;
      }
    } else {
      throw `Commande inconnue ${type}`
    }
  });
}
