const path = require('path');
const RemovePlugin  = require('remove-files-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            },
          }
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  plugins: [
    new RemovePlugin({
      before: {
        test: [
          {
            folder: '.dist',
            method: () => true
          }
        ],
        exclude: [
          './dist/.git'
        ]
      }
    }),
    new copyWebpackPlugin({
      patterns: [
        {from:'src/html', to:'.'},
      ]
    }),
  ],
  entry: './src/js/index.ts',
  output: {
    filename: 'icosa.js',
    path: path.resolve(__dirname, 'dist'),
  },
  watch: true,
};
