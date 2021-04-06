module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/constellation/" : "/",
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  }
};
