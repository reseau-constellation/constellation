import { ipcMain } from "electron";

import { lancerServeur } from "@constl/serveur";

export default () => {
  let fermerServeur: (() => void) | undefined = undefined;
  let port: number | undefined = undefined;

  ipcMain.on("àPrincipal:serveurLocal", async (_event: Event, message) => {
    const { type, portDésiré } = message;

    if (type === "activer") {
      if (fermerServeur) {
        if (port === portDésiré) {
          return;
        } else {
          fermerServeur();
        }
      }
      ({ fermerServeur, port } = await lancerServeur({ port: portDésiré }));
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
