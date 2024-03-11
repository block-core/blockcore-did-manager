const webpack = require('webpack');

module.exports = {
    resolve: {
        fallback: {
            vm: false,
            "sodium-native": false,
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer")
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.NormalModuleReplacementPlugin(
            /node:crypto/,
            require.resolve('crypto-browserify')
        ),
        new webpack.DefinePlugin({
            global: 'globalThis',
            Buffer: 'buffer.Buffer'
        }),
    ],
};