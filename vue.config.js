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
      externals: ["ipfs"],

      chainWebpackMainProcess: (config) => {
        // Chain webpack config for electron main process only
        config.module
          .rule("compile")
          .test(/\.ts$/)
          .use("babel")
          .loader("babel-loader")
          .options({
            presets: ["@babel/preset-typescript", "@vue/cli-plugin-babel/preset"]
          });
        config.node
          .set('__dirname', true)
      },
      // externals: ["ipfs", "ipfsd-ctl"], // Cette ligne est magique - ne pas l'enlever !
    },
  },
};
