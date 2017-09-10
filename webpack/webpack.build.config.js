import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtrackTextPlugin from 'extract-text-webpack-plugin';
import StyleLintPlugin from 'stylelint-webpack-plugin';
import WarnCaseSensitiveModulesPlugin from 'webpack/lib/WarnCaseSensitiveModulesPlugin';
import Visualizer from 'webpack-visualizer-plugin';
import SimpleProgressPlugin from 'webpack-simple-progress-plugin';
import constants from '../config/constants';
import config from './config';

const paths = config.UTILS_PATH;
WarnCaseSensitiveModulesPlugin.prototype.apply = () => {};

const webpackConfig = {
    node: {
        fs: 'empty'
    },
    bail: true,
    module: {},
    plugins: [
        new SimpleProgressPlugin(),
        new StyleLintPlugin(),
        new HtmlWebpackPlugin({
            template: `${paths.client('index.html.hbs')}`,
            hash: false,
            filename: 'index.html',
            chunks: ['polyfill', 'app'],
            chunksSortMode: (chunkA, chunkB) => {
                return (chunkA.names[0] < chunkB.names[0]) ? 1 : -1;
            },
            inject: 'body',
            minify: {
                collapseWhitespace: false
            }
        }),
        new webpack.DefinePlugin({
            ...constants,
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
            'process.env.REDUX_DEVTOOLS_PORT': process.env.REDUX_DEVTOOLS_PORT ? JSON.stringify(process.env.REDUX_DEVTOOLS_PORT) : 8000
        }),
        new ExtrackTextPlugin({
            filename: '[name].[hash].css',
            allChunks: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new Visualizer()
    ]
};

const APP_ENTRY_PATH = `${paths.base(config.APP_PATH)}/${config.APP_MAIN}`;

webpackConfig.entry = {
    polyfill: ['babel-polyfill'],
    app: APP_ENTRY_PATH
};

webpackConfig.resolve = {
    modules: [
        paths.base(config.APP_PATH),
        paths.base('node_modules')
    ],
    alias: {
        envConfig: paths.base('config', process.env.EXEC_ENV || 'development'),
        AliasStyles: path.resolve(__dirname, '../src/styles'),
        AliasCommon: path.resolve(__dirname, '../src/common'),
        AliasUI: path.resolve(__dirname, '../src/common/ui'),
        AliasImages: path.resolve(__dirname, '../src/styles/images'),
        AliasPages: path.resolve(__dirname, '../src/pages')
    }
};

webpackConfig.output = {
    filename: '[name].[hash].js',
    path: paths.base(config.DIST_PATH)
    // publicPath: `http://${config.HOST}:${config.DEV_SERVER_PORT}/`
};


let scssLoader = ['modules', 'localIdentName=[local]:[hash:base64]', 'importLoaders=1', 'sourceMap'];
let cssLoader = ['modules', 'localIdentName=[local]:[hash:base64]', 'sourceMap'];


scssLoader = 'css-loader?' + scssLoader.join('&');
cssLoader = 'css-loader?' + cssLoader.join('&');

const jsLoaders = [
    {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        include: [/src/, /config/],
        use: ['react-hot-loader', 'babel-loader?retainLines=true', 'eslint-loader']
    }
];

const styleLoaders = [
    {
        test: /\.scss$/,
        use: [
            'style-loader',
            scssLoader,
            'postcss-loader',
            'sass-loader'
        ]
    },
    {
        test: /\.css$/,
        use: [
            'style-loader',
            cssLoader,
            'postcss-loader'
        ]
    }
];

const fontLoader = [
    {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        exclude: /node_modules/,
        loader: 'url-loader',
        options: {
            name: 'fonts/[name].[ext]',
            limit: '2000'
        }
    }
];

const imageLoader = [
    {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        exclude: /node_modules/,
        loader: 'url-loader',
        options: {
            name: 'img/img-[hash:6].[ext]',
            limit: '5000'
        }
    }
];

const jsonLoaders = [
    {
        test: /\.json$/,
        loader: 'json-loader'
    }
];

const handlebarsLoaders = [
    {
        test: /\.hbs$/,
        loader: 'handlebars-loader'
    }
]

const lessLoader = [
    {
        test: /\.less$/,
        loader: "style-loader!css-loader!less-loader"
    }
]

webpackConfig.module.loaders = [
    ...jsLoaders,
    ...styleLoaders,
    ...lessLoader,
    ...fontLoader,
    ...imageLoader,
    ...jsonLoaders,
    ...handlebarsLoaders
];

webpackConfig.module.loaders.filter((loader) =>
    loader.loaders && loader.loaders.find((name) => /css/.test(name.split('?')[0]))
).forEach((loader) => {
    const [first, ...rest] = loader.loaders;
    loader.loader = ExtrackTextPlugin.extract({
        fallback: first,
        use: rest
    });
    delete loader.loaders;
});

webpackConfig.output.publicPath = config.COMPLITER_PUBLIC_PATH;

export default webpackConfig;
