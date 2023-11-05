import webpack from 'webpack'
import path from 'path'
import nodeExternals from 'webpack-node-externals'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpackDevServer from 'webpack-dev-server' 
import memfs from 'memfs'

declare var __non_webpack_require__: any

const config = __non_webpack_require__( '../../../riser.json' )

const random = () => 'abcdefghijklmnopqrstuvwxyz'[ Math.floor( Math.random() * 26 ) ] + Math.random().toString( 36 ).slice( -9 )

const trvr = ( target: any ) => {
	let props: any = []
  for ( let key in target ) {
		if ( target[ key ]?.type == 'ThisExpression' ) {
			if ( !props.includes( target.property.name && !target.property.name.startsWith( 'on' ) ) ) props.push( target.property.name )
		} else if ( key == 'expressions' ) {
			for ( let i in target[ key ] ) {
				for ( let e of trvr( target[ key ][ i ] ) ) if ( !props.includes( e ) && !e.startsWith( 'on' ) ) props.push( e )
			}
		} else if ( typeof target[ key ] === 'object' ) {
			for ( let i of trvr( target[ key ] ) ) if ( !props.includes( i ) && !i.startsWith( 'on' ) ) props.push( i )
    }
  }
	return props
}

const enableReactivity = ( { types: t }: any ) => {

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
		return t.jSXAttribute(
			t.jSXIdentifier( random() ),
			t.jSXExpressionContainer(
				t.logicalExpression(
					'&&',
					t.memberExpression( t.memberExpression( t.memberExpression( t.thisExpression(), t.identifier( state ) ), t.identifier( 'q' ) ), t.identifier( 'state' ) ),
					t.callExpression(
						t.memberExpression( t.memberExpression( t.memberExpression( t.thisExpression(), t.identifier( state ) ), t.identifier( 'q' ) ), t.identifier( 'append' ) ),
						[
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
		)
	}

	return {
		visitor: {
			JSXFragment( path: any ) {
				path.replaceWith(
					t.jSXElement( t.jSXOpeningElement( t.jSXIdentifier( 'div' ), [] ), t.jSXClosingElement( t.jSXIdentifier( 'div' ) ), path.node.children )
				)
			},
			JSXElement( path: any ) {
				const { openingElement: { attributes }, children } = path.node
				const uid = random()

				for ( let a in attributes ) {
					const { name: { name }, value: { type, expression } } = attributes[ a ]
					if ( type != 'JSXExpressionContainer' || name.startsWith( 'on' ) || name == uid ) continue
					let props: any = []
					if ( expression?.type == 'MemberExpression' ) {
						props = trvr( expression )
					}
					if ( props.length > 0 ) {
						attributes.unshift( t.jSXAttribute( t.jSXIdentifier( uid ), t.stringLiteral( '' ) ) )
						props.map( ( p: string ) => attributes.push( save( p, expression, uid, 'attributes', name ) ) )
					}
				}

				for ( let a in attributes ) {
					const { name: { name }, value: { type, expression } } = attributes[ a ]
					if ( type != 'JSXExpressionContainer' || name.startsWith( 'on' ) || name == uid ) continue
					let props: any = []
					if ( expression?.type == 'TemplateLiteral' ) {
						for ( let i in expression.expressions ) props = [ ...props, ...trvr( expression.expressions[ i ] ) ]
					}
					if ( props.length > 0 ) {
						attributes.unshift( t.jSXAttribute( t.jSXIdentifier( uid ), t.stringLiteral( '' ) ) )
						props.map( ( p: string ) => attributes.push( save( p, expression, uid, 'attributes', name ) ) )
					}
				}

				for ( let c in children ) {
					const { type, value } = children[ c ]
					if ( type == 'JSXText' && [ '\n', '\t', ' ' ].includes( value[ 0 ] ) ) children.splice( c, 1 )
				}

				for ( let c in children ) {
					const { type, expression } = children[ c ]
					let props = [], cat = '', index = c
					if ( type != 'JSXExpressionContainer' ) continue
					if ( expression?.type == 'CallExpression' && expression?.arguments[ 0 ].type == 'ArrowFunctionExpression' && expression?.callee.property.name == 'map' ) {
						const r = random()
						replaceFragment( expression.arguments[ 0 ].body )
						expression.arguments[ 0 ].body.openingElement.attributes.unshift( t.jSXAttribute( t.jSXIdentifier( r ), t.stringLiteral( '' ) ) )
						cat = 'iteration'
						props = trvr( expression )
						index = `${c}-${r}`
					} else if ( [ 'MemberExpression', 'TemplateLiteral', 'LogicalExpression' ].includes( expression?.type ) ) {
						cat = 'children'
						props = trvr( expression )
					} else if ( expression?.type == 'ConditionalExpression' ) {
						const r = random()
						replaceFragment( expression.consequent )
						replaceFragment( expression.alternate )
						expression.consequent.openingElement.attributes.unshift( t.jSXAttribute( t.jSXIdentifier( r ), t.stringLiteral( '' ) ) )
						expression.alternate.openingElement.attributes.unshift( t.jSXAttribute( t.jSXIdentifier( r ), t.stringLiteral( '' ) ) )
						cat = 'children'
						props = trvr( expression )
					}
					if ( props.length > 0 ) {
						attributes.unshift( t.jSXAttribute( t.jSXIdentifier( uid ), t.stringLiteral( '' ) ) )
						props.map( ( p: string ) => attributes.push( save( p, expression, uid, cat, index ) ) )
					}
				}
			}
		}
	}
}

const flogs = /\.(view|component).(js|jsx|ts|tsx)?$/
const blogs = /\.(gateway|guard|database).(js|jsx|ts|tsx)?$/

const log = ( regex: RegExp, stats: any ) => {
	console.log( stats.toString( {
		colors: true,
		assets: false,
		excludeModules: [ ( m: string ) => !regex.test( m ) ]
	} ) )
}

const fConfig: any = {
  mode: 'development',
  entry: {
    index: [
			'./node_modules/riser/dist/frontend/loader',
			'./node_modules/riser/dist/frontend/runtime',
		]
  },
	stats: {
		colors: true,
		assets: false,
		excludeModules: [ ( m: string ) => !flogs.test( m ) ]
	},
	infrastructureLogging: { level: 'error' },
	target: 'web',
  devtool: 'source-map',
  resolve: {
		extensions: [ '.js', '.jsx', '.ts', '.tsx', '.css' ],
	},
	module: {
		rules: [ { 
			test: /\.(js|jsx|ts|tsx)$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: [
						[ '@babel/preset-env' ],
						[ '@babel/typescript' ],
						[ '@babel/preset-react', { 'pragma': 'global.jsx.createElement', 'pragmaFrag': 'global.jsx.Fragment' } ]
					],
					plugins: [
						[ '@babel/plugin-proposal-decorators', { 'legacy': true } ],
						[ enableReactivity ]
					]
				}
			}
		},
		{
			test: /\.(png|ico)$/,
			type: 'asset/resource',
			generator: { filename: 'assets/[name][ext]' },
		},
		]
	},
  plugins: [
		new HtmlWebpackPlugin( { template: './node_modules/riser/index.html', inject: false, title: config.appname } ),
		new webpack.DefinePlugin( { 'broker': JSON.stringify( config.broker ) } )
  ],
  output: {
    filename: 'index.js',
    path: path.resolve( __dirname, 'dist' )
  },
}

const bConfig: any = {
	mode: 'development',
	entry: {
		main: [
			'./node_modules/webpack/hot/poll?1000',
			'./node_modules/riser/dist/backend/loader',
			'./node_modules/riser/dist/backend/runtime',
		]
	},
	target: 'node',
	stats: 'none',
	output: {
		path: path.join( __dirname, '../../../dist' ),
		filename: 'main.js',
		hotUpdateChunkFilename: 'main.[fullhash].hot-update.js',
		hotUpdateMainFilename: 'main.[fullhash].hot-update.json',
	},
	externals: [
		nodeExternals()
	],
	resolve: {
		extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
	},
	module: {
		rules: [ { 
			test: /\.(js|jsx|ts|tsx)$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: [
						[ '@babel/preset-env' ],
						[ '@babel/typescript' ]
					],
					plugins: [
						[ '@babel/plugin-proposal-decorators', { 'legacy': true } ]
					]
				}
			}
		} ]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin( ),
		new webpack.DefinePlugin( { 'broker': JSON.stringify( config.broker ) } )
	]
}	

if ( process.argv[ process.argv.length - 1 ] == 'dev' ) {
	
	const fCompiler = webpack( fConfig )

	new webpackDevServer( { hot: true, client: { logging: 'none' }, liveReload: true, port: config.development.port, historyApiFallback: true }, fCompiler ).start( )

	const bCompiler: any = webpack( bConfig )
	bCompiler.outputFileSystem = memfs
	bCompiler.watch( { }, ( err: any, stats: any ) => {
		log( blogs, stats )
		if ( ( global as any ).disconnect ) ( global as any ).disconnect( )
		eval( bCompiler.outputFileSystem.readFileSync( `${bConfig.output.path}/main.js` ).toString( ) )
	} )

} else {

	const fCompiler = webpack( fConfig )
	fCompiler.run( ( err, stats ) => log( flogs, stats ) )

	const bCompiler = webpack( bConfig )
	bCompiler.run( ( err, stats ) => log( blogs, stats ) )
	
}
