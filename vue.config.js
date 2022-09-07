const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");

const serverConfig = {
  entry: "./src/entry-server.js",
  target: "node",
  devtool: "source-map",
  output: {
    libraryTarget: "commonjs2",
  },
  externals: nodeExternals({
    allowlist: /\.css$/,
  }),
  optimization: {
    splitChunks: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.VUE_ENV": JSON.stringify(process.env.VUE_ENV || "server"),
    }),
    // This is the plugin that turns the entire output of the server build
    // into a single JSON file. The default file name will be
    // `vue-ssr-server-bundle.json`
    new VueSSRServerPlugin(),
  ],
};

const cilentConfig = {
  entry: "./src/entry-client.js",
  optimization: {
    runtimeChunk: {
      name: "manifest",
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.VUE_ENV": JSON.stringify(process.env.VUE_ENV || "client"),
    }),
    // This plugins generates `vue-ssr-client-manifest.json` in the
    // output directory.
    new VueSSRClientPlugin(),
  ],
};

const isServer = process.env.VUE_ENV === "server";
module.exports = {
  outputDir: "public",
  configureWebpack: isServer ? serverConfig : cilentConfig,
  chainWebpack: (config) => {
    if (isServer) {
      // fix ssr bug: document not found -- https://github.com/Akryum/vue-cli-plugin-ssr/blob/master/lib/webpack.js
      const isExtracting = config.plugins.has("extract-css");
      if (isExtracting) {
        // Remove extract
        const langs = ["css", "postcss", "scss", "sass", "less", "stylus"];
        const types = ["vue-modules", "vue", "normal-modules", "normal"];
        for (const lang of langs) {
          for (const type of types) {
            const rule = config.module.rule(lang).oneOf(type);
            rule.uses.delete("extract-css-loader");
            // Critical CSS
            rule.use("vue-style").loader("vue-style-loader").before("css-loader");
          }
        }
        config.plugins.delete("extract-css");
      }

      config.module
        .rule("vue")
        .use("cache-loader")
        .tap((options) => {
          // Change cache directory for server-side
          options.cacheIdentifier += "-server";
          options.cacheDirectory += "-server";
          return options;
        });

      // todo: check if this is needed
      // // https://github.com/ediaos/vue-cli3-ssr-project/blob/master/vue.config.js#L151
      // // fix ssr hot update bug
      // config.plugins.delete("hmr");
    }

    config.module
      .rule("vue")
      .use("vue-loader")
      .tap((options) => {
        if (isServer) {
          options.cacheIdentifier += "-server";
          options.cacheDirectory += "-server";
        }
        options.optimizeSSR = isServer;
        return options;
      });
  },
};
