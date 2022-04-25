const enDéveloppement = process.env.NODE_ENV !== "production";

const plugins = [
  ["@babel/plugin-proposal-decorators", { legacy: true }],
  ["@babel/plugin-proposal-private-methods", { loose: true }],
  ["@babel/plugin-proposal-class-properties", { loose: true }],
  ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
  ["@babel/plugin-proposal-optional-chaining"],
  [
    "add-module-exports",
    {
      addDefaultProperty: false,
    },
  ],
];

// Un autre mystère...
if (!enDéveloppement) plugins.push(["@babel/plugin-transform-runtime"]);

module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins,
};
