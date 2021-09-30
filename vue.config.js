const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const enDéveloppement = process.env.NODE_ENV !== "production";

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
      chainWebpackRendererProcess: (config) => {

      },
      chainWebpackMainProcess: (config) => {
        // Mystère et boule de gomme
        config.resolve.alias
          .set("multiformats/hashes/sha2", "multiformats/cjs/src/hashes/sha2.js");

        // Chain webpack config for electron main process only
        config.module
          .rule("compile")
          .test(/\.(t|j)s$/)
          .use("babel")
          .loader("babel-loader")
          .options({
            presets: [
              "@babel/preset-typescript",
              "@vue/cli-plugin-babel/preset",
              ["@babel/env", { "modules": "commonjs" }]
            ],
          });
      },
    },
  },
};
