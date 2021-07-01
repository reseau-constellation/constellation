const webpack = require("webpack");
const merge = require("webpack-merge")
module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/constellation/" : "/",
  transpileDependencies: ["vuetify"],
  productionSourceMap: false,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      contextIsolation: false,
      externals: ["ipfs", "ipfsd-ctl"], // Cette ligne est magique - ne pas l'enlever !
    },
  }
};
