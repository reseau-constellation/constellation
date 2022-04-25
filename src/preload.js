const { contextBridge, ipcRenderer } = require("electron");

// https://github.com/electron/electron/issues/9920#issuecomment-575839738
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("ipa", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ["toMain"];
    console.log("preload.js, toMain", channel, data)
    if (validChannels.includes(channel)) {
      console.log("message envoyé !")
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      console.log("preload.js, fromMain", channel, func)

      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => {console.log("preload.js, fromMain, f", channel, args); func(...args)});
    }
  },
});
