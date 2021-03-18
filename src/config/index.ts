import isElectron from "is-electron";
import { LocalStorage } from "node-localstorage";
import Store from "electron-store";

const obtPlateforme = function() {
  if (window) {
    return isElectron() ? "électron" : "navigateur";
  }
  return "node";
};

export const plateforme = obtPlateforme();

export let store: typeof Store;
switch (plateforme) {
  case "électron":
    store = new Store();
    store.getItem = store.get;
    store.setItem = store.set;
    store.removeItem = store.delete;
    break;
  case "node":
    store = new LocalStorage("./réseau-config");
    break;
  default:
    store = localStorage;
    break;
}
