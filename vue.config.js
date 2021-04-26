const webpack = require("webpack");
module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/constellation/" : "/",
  transpileDependencies: ["vuetify", "ipfs-daemon"],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ["ipfs", "ipfsd-ctl"]
    }
  }
};
