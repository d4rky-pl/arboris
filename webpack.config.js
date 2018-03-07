const path = require('path');
const merge = require('lodash.merge')


const nodeBabel = {
  loader: 'babel-loader',
  options: { presets: [ ['env', { targets: { "node": "current" } }] ] }
}

const browserBabel = {
  loader: 'babel-loader',
  options: { presets: [ ['env', { targets: { "browsers": "last 2 versions, > 5%" } }] ] }
}

const defaultConfig = {
  devtool: 'source-map',
  output: {
    path: __dirname,
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
        test: /src\/(\.js)$/,
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

const makeConfig = function(entry, target) {
  const newConfig = merge({}, defaultConfig)
  newConfig.entry = `${__dirname}/src/${entry}.js`
  newConfig.target = target
  
  if(target === 'node') {
    newConfig.output.filename = `lib/${entry}.js`
    newConfig.module.rules[0].use = nodeBabel
  } else {
    newConfig.output.filename = `lib/${entry}.${target}.js`
    newConfig.module.rules[0].use = browserBabel
  }
  
  return newConfig
}

module.exports = [ makeConfig('index', 'node'), makeConfig('index', 'web') ]