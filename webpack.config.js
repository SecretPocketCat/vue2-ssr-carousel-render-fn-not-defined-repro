const webpack = require("webpack");
const { merge } = require("webpack-merge");
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const nodeExternals = require("webpack-node-externals");
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");

const isSsr = process.env.VUE_ENV === "server";
const target = "es2015";

/** @type {import('webpack').Configuration} */
const commonConfig = {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name].[contenthash:8].js",
    publicPath: "/",
    chunkFilename: "[name].[contenthash:8].js",
  },
  module: {
    rules: [
      {
        test: /\.vue$/i,
        loader: "vue-loader",
        exclude: /node_modules/i,
        options: {
          compilerOptions: {
            preserveWhitespace: true,
            // optimizeSSR: isSsr // this should not be needed?
          },
        },
      },
      {
        test: /\.[jt]s$/i,
        loader: "esbuild-loader",
        exclude: /node_modules/i,
        options: {
          target,
        },
      },
      {
        test: /\.css$/i,
        use: ["vue-style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".ts", ".vue"],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      "process.env.VUE_ENV": JSON.stringify("server"),
    }),
  ],
};

/** @type {import('webpack').Configuration} */
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
  plugins: [new VueSSRServerPlugin()],
};

/** @type {import('webpack').Configuration} */
const clientConfig = {
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
  plugins: [new VueSSRClientPlugin()],
};

const mergedConf = merge(commonConfig, isSsr ? serverConfig : clientConfig);

module.exports = mergedConf;
