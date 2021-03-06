const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

/**
 * --env.production
 * --env.port port
 */

const PAGE_TITLE = "react-svg-pan-zoom - A React component that adds pan and zoom features to SVG";
const VENDORS_LIBRARIES = ['react', 'react-dom', 'prismjs', 'remarkable'];

module.exports = function (env) {
  let isProduction = env && env.hasOwnProperty('production');
  let port = env && env.hasOwnProperty('port') ? env.port : 8080;

  if (isProduction) console.info('Webpack: Production mode'); else console.info('Webpack: Development mode');

  let config = {
    context: path.resolve(__dirname),
    entry: {
      app: './src/renderer.jsx',
      vendor: VENDORS_LIBRARIES
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[chunkhash].[name].js',
    },
    devtool: isProduction ? 'source-map' : 'eval',
    performance: {
      hints: isProduction ? 'warning' : false
    },
    devServer: {
      port: port,
      contentBase: path.join(__dirname, './dist'),
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [{
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              "compact": false,
              "plugins": [
                "transform-object-rest-spread"
              ],
              "presets": [
                "es2015-webpack2",
                "react"
              ]
            }
          }
        ]
      }, {
        test: /\.md$/,
        use: [
          {
            loader: "raw-loader"
          }
        ]
      }, {
        test: /\.svg$/,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }]
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest'],
        minChunks: Infinity,
        filename: '[chunkhash].[name].js'
      }),

      new HtmlWebpackPlugin({
        title: PAGE_TITLE,
        template: './src/index.html.ejs',
        filename: 'index.html',
        inject: 'body',
      })
    ]
  };

  if (isProduction) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());

    config.plugins.push(new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }));
  }

  if (!isProduction) {
    config.plugins.push(new OpenBrowserPlugin({url: `http://localhost:${port}`}))
  }

  return config;
};
