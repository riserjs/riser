const path = require( 'path' )
const webpack = require( 'webpack' )
const nodeExternals = require( 'webpack-node-externals' )
const CopyPlugin = require( 'copy-webpack-plugin' )

const config = {
	mode: 'production',
	resolve: {
		extensions: [ '.js', '.ts' ],
	},
	module: {
		rules: [
			{ 
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[ '@babel/preset-env' ], 
							[ '@babel/typescript' ],
						],
						plugins: [
							[ 'babel-plugin-transform-typescript-metadata' ],
							[ '@babel/plugin-proposal-decorators', { legacy: true } ],
							[ '@babel/plugin-transform-class-properties', { loose: true } ],
							[ '@babel/plugin-transform-private-methods', { loose: true } ],
							[ '@babel/plugin-transform-private-property-in-object', { loose: true } ],
							[ '@babel/plugin-transform-optional-chaining' ]
						]
					}
				}
			}
		]
	}
}

const frontend = {
	...config,
	entry: {
		runtime: './src/frontend/runtime.ts',
	},
	target: 'web',
	output: {
		path: path.resolve( __dirname, 'dist/frontend' ),
		filename: '[name].js',
	},
	externals: [
		nodeExternals()
	],
	plugins: [
		new CopyPlugin( { patterns: [ 'src/frontend/loader.js' ] } ),
	]
}

const core = {
	...config,
	entry: {
		core: './src/core.ts',
	},
	output: {
		path: path.resolve( __dirname, 'dist' ),
		globalObject: 'this',
		libraryTarget: 'commonjs2',
		filename: '[name].js',
	}
}

const backend = {
	...config,
	entry: {
		runtime: './src/backend/runtime.ts',
	},
	target: 'node',
	output: {
		path: path.resolve( __dirname, 'dist/backend' ),
		filename: '[name].js',
	},
	externals: [
		nodeExternals()
	],
	plugins: [
		new CopyPlugin(	{
			patterns: [ 'src/backend/loader.js'],
		}	)
	]
}

const cli = {
	...config,
	entry: {
		cli: './src/cli.ts'
	},
	target: 'node',
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: '[name].js',
	},
	externals: [
		nodeExternals()
	],
	plugins: [
		new webpack.BannerPlugin( { banner: "#!/usr/bin/env node", raw: true } ),
	]
}

module.exports = [ frontend, backend, core, cli ]