const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/constellation/" : "/",
  transpileDependencies: ["vuetify"],
  productionSourceMap: false,
  configureWebpack: {
    plugins: [new NodePolyfillPlugin()],
    resolve: {
      fallback: {
        fs: false,
      },
    },
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      contextIsolation: false,
      externals: ["ipfs", "ipfsd-ctl"], // Cette ligne est magique - ne pas l'enlever !
    },
  },
};
