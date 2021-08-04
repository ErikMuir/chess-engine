const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
  console.log(env);
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        { test: /\.(js)$/, use: 'babel-loader' },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        { test: /\.(jpg|png)$/, use: { loader: 'url-loader' } },
        { test: /\.svg$/, use: [{ loader: 'svg-url-loader', options: { limit: 10000 } }] },
      ],
    },
    mode: 'development',
    plugins: [
      new webpack.EnvironmentPlugin({
        LOG_LEVEL: env.LOG_LEVEL || 'info',
        LOGGERS: process.env.npm_config_loggers || null, // npm run start:trace --loggers=Game,Board
      }),
      new HtmlWebpackPlugin({ template: './public/index.html' }),
    ],
  };
};
