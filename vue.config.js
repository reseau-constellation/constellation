const webpack = require("webpack");
module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/constellation/" : "/",
  transpileDependencies: ["vuetify"],
  productionSourceMap: false,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ["ipfs", "ipfs-daemon"],
    },
  },
};
