import webpack from 'webpack'
import path from 'path'
import nodeExternals from 'webpack-node-externals'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const random = () => 'abcdefghijklmnopqrstuvwxyz'[ Math.floor( Math.random() * 26 ) ] + Math.random().toString( 36 ).slice( -9 )

const trvr = ( target: any ) => {
	let props: any = []
  for ( let key in target ) {
		if ( target[ key ]?.type == 'ThisExpression' ) {
			props.push( target.property.name )
		} else if ( typeof target[ key ] === 'object' ) {
			props = [ ...props, ...trvr( target[ key ] ) ]
    }
  }
	return props
}

const myplugin = ( { types: t }: any ) => {

	const save = ( state: string, expression: any, uid: string, type: string, param: string | number ) => {
		return t.jSXAttribute(
			t.jSXIdentifier( random() ),
			t.jSXExpressionContainer(
				t.logicalExpression(
					'&&',
					t.memberExpression( t.memberExpression( t.memberExpression( t.thisExpression(), t.identifier( state ) ), t.identifier( 'q' ) ), t.identifier( 'state' ) ),
					t.optionalCallExpression(
						t.memberExpression( t.memberExpression( t.memberExpression( t.thisExpression(), t.identifier( state ) ), t.identifier( 'q' ) ), t.identifier( 'append' ) ),
						[
							t.stringLiteral( uid ),
							t.stringLiteral( type ),
							t.objectExpression( [
								t.objectProperty( t.stringLiteral( typeof param === 'string' ? 'name' : 'index' ), typeof param === 'string' ? t.stringLiteral( param ) : t.numericLiteral( param ) ),
								t.objectProperty( t.identifier( 'value' ), t.arrowFunctionExpression( [], expression, false ) ),
							] )
						],
						true
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
			JSXExpressionContainer( path: any ) {
				const { expression } = path.node
				const uid = random()
				if ( expression.type == 'CallExpression' && expression.callee.type == 'MemberExpression' && expression.callee.object.type == 'MemberExpression' && expression.callee.property.name == 'map' ) {
					expression.arguments[ 0 ].body.openingElement.attributes.unshift( t.jSXAttribute( t.jSXIdentifier( uid ), t.stringLiteral( '' ) ) )
					path.parent.openingElement.attributes.push( save( expression.callee.object.property.name, expression, uid, 'iteration', 0 ) )
				} else if ( expression.type == 'ConditionalExpression' && expression.test.type == 'MemberExpression' && expression.test.object.type == 'ThisExpression' ) {
					expression.consequent.openingElement.attributes.unshift( t.jSXAttribute( t.jSXIdentifier( uid ), t.stringLiteral( '' ) ) )
					expression.alternate.openingElement.attributes.unshift( t.jSXAttribute( t.jSXIdentifier( uid ), t.stringLiteral( '' ) ) )
					path.parent.openingElement.attributes.push( save( expression.test.property.name, expression, uid, 'condition', 0 ) )
				}
			},
			JSXElement( path: any ) {
				const { openingElement: { attributes }, children } = path.node
				const uid = random()

				for ( let i in children ) {
					const { type, value } = children[ i ]
					if ( type == 'JSXText' && [ '\n', '\t', ' ' ].includes( value[ 0 ] ) ) children.splice( i, 1 )
				}

				for ( let i in children ) {
					const { type, expression } = children[ i ]
					let props: any = []
					if ( type != 'JSXExpressionContainer' ) continue
					if ( expression?.type === 'MemberExpression' ) {
						props = trvr( expression )
					} else if ( expression?.type === 'TemplateLiteral' ) {
						for ( let i in expression.expressions ) props = [ ...props, ...trvr( expression.expressions[ i ] ) ]
					} else if ( expression?.type === 'LogicalExpression' ) {
						props = [ ...trvr( expression.left ), ...trvr( expression.right ) ]
					} else if ( expression?.type == 'ConditionalExpression' ) {
						props = [ ...trvr( expression.test.left ), ...trvr( expression.test.right ) ]
					}
					if ( props.length > 0 ) {
						attributes.unshift( t.jSXAttribute( t.jSXIdentifier( uid ), t.stringLiteral( '' ) ) )
						props.map( ( p: string ) => attributes.push( save( p, expression, uid, 'children', i ) ) )
					}
				}
	
				for ( let a in attributes ) {
					const { name: { name }, value: { expression } } = attributes[ a ]
					if ( !name.startsWith( 'on' ) && expression?.type === 'MemberExpression' && expression?.object.type === 'ThisExpression' ) {
						const name = getName( expression )
						attributes.unshift( t.jSXAttribute( t.jSXIdentifier( uid ), t.stringLiteral( '' ) ) )
						attributes.push( save( name, expression, uid, 'attributes', name ) )
					}
				}

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
 
declare var __non_webpack_require__: any
declare global { var config: any }

const fConfig: any = {
	mode: 'development',
	entry: {
		index: [
			'./node_modules/webpack-hot-middleware/client?reload=true&timeout=1000',
			'./node_modules/quartzjs/dist/frontend/loader',
			'./node_modules/quartzjs/dist/frontend/runtime',
		]
	},
	output: {
		path: path.join( __dirname, '../../../dist' ),
		filename: 'index.js',
		publicPath: '/',
		hotUpdateChunkFilename: 'index.[fullhash].hot-update.js',
		hotUpdateMainFilename: 'index.[fullhash].hot-update.json',
	},
	devtool: 'source-map',
	stats: {
		colors: true,
		assets: false,
		excludeModules: [ m => !/\.(view|component).(jsx|tsx)?$/.test( m ) ]
	},
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
						'@babel/preset-env', '@babel/typescript',
						[ '@babel/preset-react', { 'pragma': 'global.jsx.createElement', 'pragmaFrag': 'global.jsx.Fragment' } ]
					],
					plugins: [
						[ '@babel/plugin-proposal-decorators', { 'legacy': true } ],
						[ myplugin ]
					]
				}
			}
		},
		{
			test: /\.css$/i,
			use: [ 'style-loader', 'css-loader', 
				{
					loader: 'postcss-loader',
					options: {
						postcssOptions: {
							plugins: {
								tailwindcss: {
									config: {
										content: [
											__dirname + '/../../src/**/*.{view,component}.{jsx,tsx}',
										],
										theme: {
											extend: {},
										},
										plugins: [],
									},
								}
							},
						},
					},
				}
			],
		},
		{
			test: /\.(png|ico)$/,
			type: 'asset/resource',
			generator: { filename: 'assets/[name][ext]', },
		},
		]
	},
	plugins: [
		new HtmlWebpackPlugin( { template: './node_modules/quartzjs/index.html', inject: false } ),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.ProvidePlugin( { process: 'process/browser' } ),
		new webpack.ProvidePlugin( { Buffer: [ 'buffer', 'Buffer' ] } ),
	]
}

const bConfig: any = {
	mode: 'development',
	entry: {
		main: [
			'./node_modules/webpack/hot/poll?1000',
			'./node_modules/quartzjs/dist/backend/loader',
			'./node_modules/quartzjs/dist/backend/runtime',
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
		extensions: [ '.js', '.ts' ],
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
		new webpack.HotModuleReplacementPlugin(),
	]
}	

const flogs = /\.(view|component).(js|jsx|ts|tsx)?$/
const blogs = /\.(gateway|guard|database).(js|jsx|ts|tsx)?$/

if ( process.argv[ process.argv.length - 1 ] == 'dev' ) {
	
	const fCompiler = webpack( fConfig )
	global.config = fCompiler

	fCompiler.watch( { }, ( err, stats ) => log( flogs, stats ) )

	const bCompiler = webpack( bConfig )
	bCompiler.watch( { }, ( err, stats ) => { log( blogs, stats ); __non_webpack_require__( '../../../dist/main' ) } )

} else {

	const fCompiler = webpack( fConfig )
	fCompiler.run( ( err, stats ) => log( flogs, stats ) )

	const bCompiler = webpack( bConfig )
	bCompiler.run( ( err, stats ) => log( blogs, stats ) )
	
}
