// const path = require('path')

// function resolve (dir) {
//   return path.join(__dirname, dir)
// }
const webpack = require('webpack')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const imageminMozjpeg = require('imagemin-mozjpeg')

module.exports = {
  // 根路径 默认使用/ vue cli 3.3+ 弃用 baseUrl
  publicPath: '/',
  // 输出目录
  outputDir: 'dist',
  assetsDir: 'assets',

  configureWebpack: {
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new ImageminPlugin(
        {
          disable: process.env.NODE_ENV !== 'production', // Disable during development
          pngquant: {
            quality: '70-80'
          },
          plugins: [
            imageminMozjpeg({
              quality: 70,
              progressive: true
            })
          ]
        }
      ),
      new webpack.BannerPlugin('Build by 打酱油'),
      // new UglifyJsPlugin() // 无法压缩es6代码
    ]
  },

  productionSourceMap: false // Disable during development
}