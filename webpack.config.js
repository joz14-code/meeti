const path = require("path")
const webpack = require("webpack")

module.exports = {
    entry: './public/js/app.js',  
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, "./public/dist")
    },
    module: {
        rules: [    
        {
            test: /\.m?js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }
        ]
    },

    mode: 'development',
    target: 'web',
    resolve: {
        extensions: ['.js', '.json'],
        fallback: {
            "fs": false,
            "path": false,
            "crypto": false
        },
        aliasFields: ['browser']
    },
    stats: {
        errorDetails: true
    }
}