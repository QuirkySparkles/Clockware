var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
    context: path.resolve(__dirname, './'),
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
        filename: 'build.js'
    },
    devServer: {
        contentBase: '/',
        historyApiFallback: {
            index: "/"
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    }, 
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': resolve('src')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            file: 'index.html',
            template: 'index.html',
            inject: true
        })
    ]
};
