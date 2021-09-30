"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
const enDéveloppement = process.env.NODE_ENV !== "production";
import Store from "electron-store";
import Ctl from "ipfsd-ctl";
import ClientConstellation from "@constl/ipa";
import path from "path";
import IPFS from "ipfs"
import fs from "fs"
// import OrbitDB from "orbit-db"

// const client = new Constellation();
let ipfsd: typeof Ctl;
async function initSFIP() {

  /*const DOSSIER_STOCKAGE_LOCAL = "./_stockageTemp";
  const LocalStorage = require("node-localstorage").LocalStorage;
  final = new LocalStorage(DOSSIER_STOCKAGE_LOCAL);
  */
  // (electron.app || electron.remote.app).getPath('userData')
  console.log("ici", 0)
  // const client = await ClientConstellation.créer();
  // console.log("ici", "Constellation créé !")
  const sfip = await IPFS.create()
  console.log("ici", "SFIP créé")
  // console.log(await sfip.id())
  // console.log("ici", "ID SFIP")

  /*
  if (!ipfsd) {
    const port = 9090;
    const server = await Ctl.createServer(port, {
      ipfsHttpModule: require("ipfs-http-client"),
      ipfsModule: require("ipfs"),
      ipfsBin: require("go-ipfs").path(),
    });
    await server.start();

    console.log({ server });
    console.log("ici 1");
    const factory = Ctl.createFactory({
      ipfsHttpModule: require("ipfs-http-client"),
      remote: true,
      endpoint: `http://localhost:${port}`, // or you can set process.env.IPFSD_CTL_SERVER to http://localhost:9090
    });
    console.log("ici 2");
    ipfsd = await factory.spawn();
    console.log({ ipfsd });
  }

  console.log("ici 3");
  const id = await ipfsd.api.id();
  console.log("ici 4");
  console.log({ id });
  */
}

async function fermerSFIP() {
  if (ipfsd) await ipfsd.stop();
}

async function fermerConstellation() {
  await fermerSFIP();
  app.quit();
}
Store.initRenderer();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env
        .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !(process.env
        .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {

    createProtocol("app");
    console.log({__dirname, __filename, cwd: process.cwd()})
    /*win.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))*/
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    //win.loadURL(`file://${path.dirname(__filename)}/index.html`)
    // win.loadURL(`file:///Users/julienmalard/atom/reseau/dist_electron/mac/constellation.app/Contents/Resources/app.asar/index.html`)
  }
  win.once("ready-to-show", () => {
    // autoUpdater.checkForUpdatesAndNotify();
  });
  autoUpdater.on("update-available", () => {
    win.webContents.send("update_available");
  });
  autoUpdater.on("update-downloaded", () => {
    win.webContents.send("update_downloaded");
  });
  ipcMain.on("restart_app", () => {
    autoUpdater.quitAndInstall();
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    fermerConstellation();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  initSFIP();
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (enDéveloppement) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        fermerConstellation();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      fermerConstellation();
    });
  }
}

// https://medium.com/@johndyer24/creating-and-deploying-an-auto-updating-electron-app-for-mac-and-windows-using-electron-builder-6a3982c0cee6
ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});
