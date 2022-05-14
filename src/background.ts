"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

import Store from "electron-store";
import path from "path";

import {
  fermerConstellation,
  connecterFenêtreÀConstellation,
} from "@/électron/initConstellation";

const enDéveloppement = process.env.NODE_ENV !== "production";

app.setAsDefaultProtocolClient("constl");

async function fermerAppli() {
  if (fermerConstellation) await fermerConstellation();
  app.quit();
}
Store.initRenderer();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let win: BrowserWindow;

// Deep linked url
let deeplinkingUrl: string;

// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock();
if (gotTheLock) {
  app.on("second-instance", (_, argv) => {
    // Someone tried to run a second instance, we should focus our window.

    // Protocol handler for win32
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform == "win32") {
      // Keep only command line / deep linked arguments
      deeplinkingUrl = argv.slice(1)[0];
      console.log(deeplinkingUrl);
    }

    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
} else {
  app.quit();
}

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 650,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env
        .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !(process.env
        .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  // const deeplink = new Deeplink({ app, mainWindow: win, protocol: "constl", isDev: enDéveloppement, electronPath: '../node_modules/electron/dist/Electron.app' });
  /*deeplink.on('received', (lien: string) => {
      console.log(lien);
      // mainWindow.webContents.send('received-link', lien);
  });*/
  // Protocol handler for win32
  if (process.platform == "win32") {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = process.argv.slice(1)[0];
    console.log({ deeplinkingUrl });
  }
  const déconnecterFenêtreDeConstellation = connecterFenêtreÀConstellation(win);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
  win.once("ready-to-show", () => {
    // autoUpdater.checkForUpdatesAndNotify();
  });

  win.once("close", () => {
    console.log("fenêtre fermée");
    déconnecterFenêtreDeConstellation();
  });

  autoUpdater.on("update-available", () => {
    win.webContents.send("dePrincipal:miseÀJourDisponible");
  });
  autoUpdater.on("update-downloaded", () => {
    win.webContents.send("dePrincipal:miseÀJourTéléchargée");
  });
  ipcMain.on("àPrincipal:réinitialiser", () => {
    autoUpdater.quitAndInstall();
  });
}

app.on("will-finish-launching", function () {
  // Protocol handler for osx
  app.on("open-url", function (event, url) {
    event.preventDefault();
    deeplinkingUrl = url;
    console.log({ deeplinkingUrl });
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", async () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    await fermerAppli();
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
  createWindow();
});

app.on("will-quit", async () => {
  await fermerAppli();
});

// Exit cleanly on request from parent process in development mode.
if (enDéveloppement) {
  if (process.platform === "win32") {
    process.on("message", async (data) => {
      if (data === "graceful-exit") {
        await fermerAppli();
      }
    });
  } else {
    process.on("SIGTERM", async () => {
      await fermerAppli();
    });
  }
}

// https://medium.com/@johndyer24/creating-and-deploying-an-auto-updating-electron-app-for-mac-and-windows-using-electron-builder-6a3982c0cee6
ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});
