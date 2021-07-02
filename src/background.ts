"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";
import Store from "electron-store";
import Ctl from "ipfsd-ctl";

let ipfsd: typeof Ctl;
async function initSFIP() {
  /* if (!ipfsd) {
    const port = 9090
    const server = await Ctl.createServer(port, {
      ipfsHttpModule: require('ipfs-http-client'),
      ipfsModule: require("ipfs")
    })
    await server.start()

    console.log({server})
    const factory = Ctl.createFactory({
      ipfsHttpModule: require('ipfs-http-client'),
      remote: true,
      endpoint: `http://localhost:${port}` // or you can set process.env.IPFSD_CTL_SERVER to http://localhost:9090
    })
    ipfsd = await factory.spawn()
    console.log(ipfsd)
  }

  const id = await ipfsd.api.id()

  console.log(id)
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
      // Required for Spectron testing
      enableRemoteModule: true,

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
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
  win.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
  autoUpdater.on("update-available", () => {
    win.webContents.send("update_available");
  });
  autoUpdater.on("update-downloaded", () => {
    win.webContents.send("update_downloaded");
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
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
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
