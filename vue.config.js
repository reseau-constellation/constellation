const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const WorkerPlugin = require("worker-plugin");
const webpack = require("webpack");

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/",
  transpileDependencies: ["vuetify"],
  productionSourceMap: false,
  configureWebpack: {
    plugins: [new WorkerPlugin(), new NodePolyfillPlugin()],
    resolve: {
      fallback: {
        fs: false,
        net: false,
        dgram: false,
        chokidar: false,
      },
    },
    experiments: { topLevelAwait: true },
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule("node")
      .test(/\.node$/)
      .use("node-loader")
      .loader("node-loader");
  },
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      rendererProcessFile: "src/mainElectron.ts",
      chainWebpackMainProcess: (config) => {
        // config.devtool(false);
        config.experiments = { topLevelAwait: true };
        config.module
          .rule("compile")
          .test(/\.(t|j)s$/)
          .exclude.add(/node_modules/)
          .end()
          .use("babel")
          .loader("babel-loader")
          .options({
            presets: [
              "@babel/preset-typescript",
              "@vue/cli-plugin-babel/preset",
//              ["@babel/env", { modules: "commonjs" }],
            ],
          plugins: [
  /*              [
                "add-module-exports",
                {
                  addDefaultProperty: false,
                },
              ],*/
              "@babel/plugin-syntax-top-level-await",
            ],
          });
        config.module
          .rule("esm")
          .test(/\.m?jsx?$/)
          .resolve.set("fullySpecified", false);
        config.module
          .rule("node")
          .test(/\.node$/)
          .use("node-loader")
          .loader("node-loader");

        // Je ne peux pas croire que ceci c'est la « vraie » façon de faire fonctionner
        // topLevelAwait dans le processus principal d'électron.
        // Mais les options de configureWebpack ne sont pas utilisés pour la
        // compilation du processus principal et je n'ai pas pu trouver une
        // option pour experiments dans webpack-chain. Donc, quelques heures plus
        // tard, nous voici...
        const toConfigOrig = config.toConfig;
        config.toConfig = function toConfig() {
          const configOrig = toConfigOrig.apply(this);
          configOrig.experiments = { topLevelAwait: true };
          return configOrig;
        };
      },
    },
  },
};
