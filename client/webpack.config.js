var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
    context: path.resolve(__dirname, './'),
    entry: {
        client: ['./src/main.js', './style.css'],
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
        filename: 'build.js'
    },
    devServer: {
        contentBase: '/',
        historyApiFallback: {
            index: '/'
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
            },
            
            {
                test: /\.css$/,
                use: [
                        { loader: 'style-loader' },
                        { loader: 'css-loader' }
                     ]
            },
            
            {
                test: /\.(png|ipg|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {}
                    }
                ]
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
            template: 'index.html',
            inject: true
        })
    ]
    
};
