require('dotenv').config();
const path = require('path');
const env = require('yargs').argv.env;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const base = '/';

if (env === 'production') {
  base = process.env.PUBLIC_URL || '/';
}

const config = {
  entry: path.resolve('./src/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: base,
  },
  devServer: {
    contentBase: './dist',
    open: true,
    overlay: {
      warnings: true,
      errors: true,
    },
    port: 3000,
    host: 'localhost',
    inline: true,
  },
  resolve: {
    extensions: ['.js'],
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve('./public/index.html'),
      base: base,
    }),
  ],
};

module.exports = config;
