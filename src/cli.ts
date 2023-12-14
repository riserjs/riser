import webpack from 'webpack'
import path from 'path'
import nodeExternals from 'webpack-node-externals'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpackDevServer from 'webpack-dev-server'
import TerserPlugin from 'terser-webpack-plugin'
import memfs from 'memfs'
import fs from 'fs'
import { random } from './utils'

const compile = { frontend: false, backend: false }

const enableCompilation = (directory) => {
  for ( const file of fs.readdirSync( directory ) ) {
    const absolute = path.join( directory, file )
    if ( fs.statSync( absolute ).isDirectory( ) ) {
      enableCompilation( absolute )
    } else if ( absolute.endsWith( '.view.tsx' ) ) {
			compile.frontend = true
    } else if ( absolute.endsWith( '.gateway.ts' ) ) {
			compile.backend = true
    }
  }
}

enableCompilation(`${__dirname}/../../../src` )

declare var __non_webpack_require__: any

const mode = process.argv[ process.argv.length - 1 ] == 'dev' ? 'development' : 'production'

const config = __non_webpack_require__( '../../../riser.config.js' )( mode )

const recursion = ( target: any ) => {
	let props: any = []

	for ( let key in target ) {
		if ( target[ key ]?.type == 'ThisExpression' && !props.includes( target.property.name ) ) {
			props.push( target.property.name )
		} else if ( target[ key ] instanceof Object ) {
			for ( let e of recursion( target[ key ] ) ) if ( !props.includes( e ) ) props.push( e )
		} 
	}

	return props
}

const enableReactivity = ( { types: t }: any ) => {

	let runtime = -1

	const replaceFragment = ( node: any ) => {
		if ( node?.type == 'JSXFragment' ) {
			node.type = 'JSXElement'
			node.openingElement = t.jSXOpeningElement( t.jSXIdentifier( 'div' ), [] )
			node.closingElement = t.jSXClosingElement( t.jSXIdentifier( 'div' ) )
			delete node.openingFragment
			delete node.closingFragment
		} 
	}

	const save = ( state: string, expression: any, uid: string, type: string, param: string | number ) => {
		return t.jSXAttribute( t.jSXIdentifier( 'runtime'+runtime++ ),
				t.jSXExpressionContainer(
					t.callExpression(
						t.memberExpression( t.thisExpression( ), t.identifier( 'append' ) ), 
						[
							t.stringLiteral( state ),
							t.stringLiteral( uid ),
							t.stringLiteral( type ),
								t.objectExpression( [
									t.objectProperty( t.stringLiteral( typeof param === 'string' ? 'name' : 'index' ), typeof param === 'string' ? t.stringLiteral( param ) : t.numericLiteral( param ) ),
									t.objectProperty( t.identifier( 'value' ), t.arrowFunctionExpression( [], expression, false ) ),
							] )
						]
				)
			)
		)
	}
	
	return {
		visitor: {
			JSXFragment( path: any ) {
				path.replaceWith(
					t.jSXElement( t.jSXOpeningElement( t.jSXIdentifier( 'div' ), [] ), t.jSXClosingElement( t.jSXIdentifier( 'div' ) ), path.node.children )
				)
			},
			JSXAttribute( path ) {
				const { name: { name }, value: { type, expression } } = path.node
				if ( type == 'JSXExpressionContainer' && expression.type == 'MemberExpression' ) {
					//console.log( name, expression )
				}
			},
			JSXElement( path: any ) {
				const { openingElement: { attributes }, children } = path.node
				const uid = random()

				let forward = false

				for ( let a in attributes ) {
					let { name: { name }, value: { type, expression } } = attributes[ a ]
					if ( type != 'JSXExpressionContainer' || name.startsWith( 'on' ) || name == uid ) continue
					if ( expression?.type == 'MemberExpression' && ( expression.object.type == 'ThisExpression' || expression.object.name == '_this' )  ) {
						forward = true
						attributes.push( save( expression.property.name, expression, uid, 'attributes', name ) )
						attributes.push( t.jSXAttribute( t.jSXIdentifier( 'parent' ), t.jSXExpressionContainer( t.memberExpression( t.thisExpression( ), t.identifier( 'id' ) ) ) ) )
						attributes.push( t.jSXAttribute( t.jSXIdentifier( `${name}-${expression.property.name}` ), t.stringLiteral( '' ) ) )
					}
				}

				for ( let a in attributes ) {
					const { name: { name }, value: { type, expression } } = attributes[ a ], props = []
					if ( type != 'JSXExpressionContainer' || name.startsWith( 'on' ) || name == uid ) continue
					if ( expression?.type == 'TemplateLiteral' ) for ( let i in expression.expressions ) props.push( ...recursion( expression.expressions[ i ] ) )
					if ( props.length > 0 ) {
						forward = true
						props.map( ( p: string ) => {
							attributes.push( save( p, expression, uid, 'attributes', name ) )
						} )
					}
				}

				for ( let c in children ) {
					const { type, value } = children[ c ]
					if ( type == 'JSXText' && [ '\n', '\t', ' ' ].includes( value[ 0 ] ) ) children.splice( c, 1 )
				}

				for ( let c in children ) {
					const { type, expression } = children[ c ]
					let props = [], cat = '', index = c, r = random()
					if ( type != 'JSXExpressionContainer' ) continue
					if ( expression?.type == 'CallExpression' && expression?.arguments[ 0 ].type == 'ArrowFunctionExpression' && expression?.callee.property.name == 'map' ) {
						replaceFragment( expression.arguments[ 0 ].body )
						expression.arguments[ 0 ].body.openingElement.attributes.unshift( t.jSXAttribute( t.jSXIdentifier( r ), t.stringLiteral( '' ) ) )
						cat = 'iteration'
						props = recursion( expression )
						index = `${c}-${r}`
					} else if ( [ 'MemberExpression', 'TemplateLiteral', 'LogicalExpression' ].includes( expression?.type ) ) {
						cat = 'children'
						props = recursion( expression )
					} else if ( expression?.type == 'ConditionalExpression' ) {
						replaceFragment( expression.consequent )
						replaceFragment( expression.alternate )
						expression.consequent.openingElement.attributes.unshift( t.jSXAttribute( t.jSXIdentifier( r ), t.stringLiteral( '' ) ) )
						expression.alternate.openingElement.attributes.unshift( t.jSXAttribute( t.jSXIdentifier( r ), t.stringLiteral( '' ) ) )
						cat = 'children'
						props = recursion( expression )
					}
					if ( props.length > 0 ) {
						forward = true
						props.map( ( p: string ) => attributes.push( save( p, expression, uid, cat, index ) ) )
					}
				}

				if ( forward ) attributes.unshift( t.jSXAttribute( t.jSXIdentifier( uid ), t.stringLiteral( '' ) ) )
			}
		}
	}
}

const log = ( regex: RegExp, stats: any ) => {
	console.log( stats.toString( {
		colors: true,
		assets: false,
		excludeModules: [ ( m: string ) => !regex.test( m ) ]
	} ) )
}

const fConfig: any = {
  mode,
  entry: {
    index: [
			'./node_modules/riser/dist/frontend/loader',
			'./node_modules/riser/dist/frontend/runtime',
		]
  },
	target: 'web',
  resolve: {
		extensions: [ '.js', '.jsx', '.ts', '.tsx', '.css' ],
	},
	optimization: {
    minimizer: [ new TerserPlugin( { extractComments: false } ) ],
  },
	module: {
		rules: [
			{ 
				test: /\.(js|jsx|ts|tsx)$/,
				exclude: /node_modules\/(?!(riser)\/).*/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[ '@babel/preset-env' ],
							[ '@babel/typescript' ],
							[ '@babel/preset-react', { 'pragma': 'global.jsx.createElement', 'pragmaFrag': 'global.jsx.Fragment' } ]
						],
						plugins: [
							[ 'babel-plugin-transform-typescript-metadata' ],
							[ '@babel/plugin-proposal-decorators', { legacy: true } ],
							[ '@babel/plugin-transform-class-properties', { loose: true } ],
							[ '@babel/plugin-transform-private-methods', { loose: true } ],
							[ '@babel/plugin-transform-private-property-in-object', { loose: true } ],
							[ '@babel/plugin-transform-optional-chaining' ],
							[ enableReactivity ]
						]
					}
				}
			},
			{
				test: /\.(png|ico)$/,
				type: 'asset/resource',
				generator: { filename: 'assets/[name][ext]' },
			}
		]
	},
  plugins: [
		new HtmlWebpackPlugin( { inject: true, title: config.appname } ),
		new webpack.DefinePlugin( { config: JSON.stringify( config ) } )
  ],
  output: {
    filename: '[name].js',
		path: path.join( __dirname, '../../../dist' ),
  },
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000
	},
}

const bConfig: any = {
	mode,
	entry: {
		main: [
			'./node_modules/riser/dist/backend/loader',
			'./node_modules/riser/dist/backend/runtime',
		]
	},
	target: 'node',
	stats: 'none',
	externals: [
		nodeExternals()
	],
	resolve: {
		extensions: [ '.js', '.ts' ],
	},
	optimization: {
    minimizer: [ new TerserPlugin( { extractComments: false } ) ],
  },
	module: {
		rules: [ { 
			test: /\.(js|ts)$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: [
						[ '@babel/preset-env' ],
						[ '@babel/typescript' ]
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
		} ]
	},
	plugins: [
		new webpack.DefinePlugin( { config: JSON.stringify( config ) } )
	],
	output: {
		path: path.join( __dirname, '../../../dist' ),
		filename: '[name].js'
	}
}	

const flogs = /\.(view|component|storage).(js|jsx|ts|tsx)?$/
const blogs = /\.(gateway|guard|service).(js|ts)?$/

if ( mode == 'development' ) {

	if ( compile.frontend ) {
		fConfig.infrastructureLogging = { level: 'none' }
		fConfig.devtool = 'source-map'
		fConfig.stats = { colors: true, assets: false, excludeModules: [ ( m: string ) => !flogs.test( m ) ] }
		
		const fCompiler = webpack( fConfig )
		new webpackDevServer( { hot: true, client: { logging: 'none' }, liveReload: true, port: config.development.port, historyApiFallback: true }, fCompiler ).start( )
	}

	if ( compile.backend ) {
		bConfig.output.hotUpdateChunkFilename = 'main.[fullhash].hot-update.js'
		bConfig.output.hotUpdateMainFilename = 'main.[fullhash].hot-update.json'
		bConfig.entry.main.push( './node_modules/webpack/hot/poll?1000' )
		bConfig.plugins.push( new webpack.HotModuleReplacementPlugin( ) )

		const bCompiler: any = webpack( bConfig )
		bCompiler.outputFileSystem = memfs
		bCompiler.watch( { }, ( err: any, stats: any ) => {
			log( blogs, stats )
			if ( ( global as any ).disconnect ) ( global as any ).disconnect( )
			eval( bCompiler.outputFileSystem.readFileSync( `${bConfig.output.path}/main.js` ).toString( ) )
		} )
	}
	
} else {

	if ( compile.frontend ) {
		const fCompiler = webpack( fConfig )
		fCompiler.run( ( err, stats ) => log( flogs, stats ) )
	}

	if ( compile.backend ) {
		const bCompiler = webpack( bConfig )
		bCompiler.run( ( err, stats ) => log( blogs, stats ) )
	}

}
