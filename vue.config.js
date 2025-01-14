'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Admin Template' // page title
// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
const port = 80 // dev port 9528

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  // lintOnSave: process.env.NODE_ENV === 'development',
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    disableHostCheck: true,
    port: port,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      // change xxx-api/login => mock/login
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      [process.env.VUE_APP_BASE_API]: {
        target: `http://localhost:${port}/mock`,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      },

      // cas单点登录跨域请求，后面我页面改成图标点击直接跳转到cas认证页面了，所以这个没用上，留着作为跨域请求的参考，然后用axios请求
      // 如下这样调用
      // 添加cas登陆给permission.js里面调用
      // casLogin({ commit }, ukey) {
      //   return new Promise((resolve, reject) => {
      //     // 临时设置一个axios的配置，用来访问cas返回用户名称的接口
      //     const service = axios.create({
      //       baseURL: '/cas', // url = base url + request url 这个/cas是在vue.config.js里的proxy设置的
      //       withCredentials: false // send cookies when cross-domain requests
      //       // timeout: 5000 // request timeout
      //     })
      //     service.get('/decuser.php',{params: {ukey: ukey,}
      //     }) .then(response => {
      //       const data = response.data  //内容像这样：jiangxianfu|1629092241|824c65894b7e985516352d9082273f79|172.18.253.20
      //       const username = data.split('|')[0]  // 获取第一个
      //       casLogin(username).then(response => {
      //         const data = response.data
      //         commit('SET_TOKEN', data.access)
      //         commit('SET_NAME', username)
      //         setToken(response.data.access)
      //         resolve()
      //       })
      //         .catch(function (error) {
      //           console.log(error)
      //           reject(error)
      //       })
      //     }).catch((err)=>{
      //       console.log(err);
      //       reject(error)
      //   })
          
      //   })
      // 注意这样会导致所有访问包括浏览器上面的url如果路径是/cas-logout都会被这个强制代理，我之前就遇到不小心url上面和这个路径配置一直导致一直被代理走找不到原因！！
      '/cas-logout': {
        target: 'https://sid.ruijie.com.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/cas-logout': ''  // 确保路径重写正确
        }
      }
    },
    after: require('./mock/mock-server.js')
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    config.plugins.delete('preload') // TODO: need test
    config.plugins.delete('prefetch') // TODO: need test

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config
    // https://webpack.js.org/configuration/devtool/#development
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-source-map')
      )

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
