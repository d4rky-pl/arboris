const path = require('path');
const merge = require('lodash.merge')

const nodeBabel = {
  loader: 'babel-loader',
  options: {
    presets: [ ['env', { targets: { "node": "current" } }] ]
  }
}

const browserBabel = {
  loader: 'babel-loader',
  options: {
    presets: [ ['env', { targets: { "browsers": "last 2 versions, > 5%" } }] ]
  }
}

const config = {
  entry: __dirname + '/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/build',
    filename: 'index.node.js',
    library: 'arboris',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    'mobx-state-tree': 'mobx-state-tree',
    'react-dom/server': 'react-dom/server'
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        exclude: /node_modules/,
        use: nodeBabel
      },
      {
        test: /(\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.json', '.js']
  }
}

const browserConfig = merge({}, config)
browserConfig.output.filename = 'index.web.js'
browserConfig.module.rules[0].use = browserBabel

module.exports = [ config, browserConfig ]
