const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const WorkerPlugin = require("worker-plugin");

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/",
  transpileDependencies: ["vuetify"],
  productionSourceMap: false,
  configureWebpack: {
    plugins: [new NodePolyfillPlugin(), new WorkerPlugin()],
    resolve: {
      fallback: {
        fs: false,
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
        // Mystère et boule de gomme
        //  config.resolve.alias.set(
        //   "multiformats/hashes/sha2",
        //   "multiformats/cjs/src/hashes/sha2.js"
        // );

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
              ["@babel/env", { modules: "commonjs" }],
            ],
            plugins: [
              [
                "add-module-exports",
                {
                  addDefaultProperty: false,
                },
              ],
            ],
          });

        config.module
          .rule("node")
          .test(/\.node$/)
          .use("node-loader")
          .loader("node-loader");
      },
    },
  },
};
