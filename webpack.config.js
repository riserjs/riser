const path = require( 'path' )
const webpack = require( 'webpack' )
const nodeExternals = require( 'webpack-node-externals' )
const TerserPlugin = require( 'terser-webpack-plugin' )

const config = {
	mode: 'production',
	resolve: {
		extensions: [ '.js', '.ts', '.tsx', '.jsx' ],
	},
	optimization: {
    minimizer: [
			new TerserPlugin( { terserOptions: { keep_classnames: true } } )
		],
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

const floader = {
	...config,
	entry: {
		loader: './src/frontend/loader.ts',
	},
	target: 'node',
	output: {
		path: path.resolve( __dirname, 'dist/frontend' ),
		filename: '[name].js',
	}
}

const bloader = {
	...config,
	entry: {
		loader: './src/backend/loader.ts',
	},
	target: 'node',
	output: {
		path: path.resolve( __dirname, 'dist/backend' ),
		filename: '[name].js',
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
	]
}

const core = {
	...config,
	entry: {
		core: './src/core.ts',
		//database: './src/database.ts',
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

module.exports = [ frontend, backend, core, cli, floader, bloader  ]