/* eslint-disable */
'use strict';

var path = require('path');
var webpack = require('webpack');
var config = require('./webpack/config')();

var rootPath = __dirname;
config.context = rootPath;

config.plugins = config.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
  // enable HMR globally

  new webpack.NamedModulesPlugin(),
  // prints more readable module names in the browser console on HMR updates

  new webpack.NoEmitOnErrorsPlugin()
  // do not emit compiled assets that include errors
])

config.output = {
  publicPath: '/static/',
  filename: '[name].js'
}

config.entry.main = ['react-hot-loader/patch', 'webpack-hot-middleware/client', path.join(rootPath, 'app/react/index.js')];

module.exports = config;
