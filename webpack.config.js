const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const parseArgs = require('minimist');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const configs = {
  development: require(path.join(__dirname, 'webpack/development.js')),
  production: require(path.join(__dirname, 'webpack/production.js')),
};

const ENV = parseArgs(process.argv.slice(2)).env;

const commonConfig = {
  entry: {
    index: path.join(__dirname, 'src/index.jsx'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        use: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              outputStyle: 'expanded',
              includePaths: [path.resolve(__dirname, 'src/styles')],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  plugins: [
    new CleanWebpackPlugin([path.join(__dirname, 'dist')]),
    new webpack.LoaderOptionsPlugin({
      test: /\.jsx?$/,
      options: {
        eslint: {
          emitWarning: ENV === 'development',
          emitError: ENV === 'production',
        },
      },
    }),
    new StyleLintPlugin({
      configFile: path.join(__dirname, '.stylelintrc'),
      files: '**/*.?(sa|sc|c)ss',
      context: path.join(__dirname, 'src'),
      emitErrors: ENV === 'production',
    }),
    new HtmlWebpackPlugin({
      title: 'hatch-react',
      template: path.join(__dirname, 'index.html'),
      inject: 'body',
      alwaysWriteToDisk: true,
    }),
    new HtmlWebpackHarddiskPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, 'public'),
        to: path.join(__dirname, 'dist'),
      },
    ]),
    new ImageminPlugin({
      disable: ENV !== 'production',
      test: /\.(jpe?g|png|gif|svg)$/i,
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new FaviconsWebpackPlugin({
      logo: path.join(__dirname, 'public/favicon/favicon.png'),
      prefix: 'favicon/',
      inject: true,
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        coast: false,
        favicons: true,
        firefox: false,
        opengraph: true,
        twitter: false,
        yandex: false,
        windows: false,
      },
    }),
  ],
};

const environmentConfig = (() => {
  switch (ENV) {
    case 'production':
    case 'staging':
      return configs.production;
    case 'development':
    default:
      return configs.development;
  }
})();

module.exports = merge(commonConfig, environmentConfig);
