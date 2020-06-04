const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    bundle: ['./app/app.js']
  },
  output: {
    path: __dirname + '/public',
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.bpmn$/,
        use: 'raw-loader'
      },      
      {
        test: /\.xslt$/,
        use: 'raw-loader'
      }
    ]
  },
  node: {
    fs: 'empty',
    net:'empty',
    tls:'empty',
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'assets/**', to: 'vendor/bpmn-js', context: 'node_modules/bpmn-js/dist/' },
      { from: '**/*.{html,css}', context: 'app/' }
    ])
  ],
  mode: 'development',
  devtool: 'source-map'
};
