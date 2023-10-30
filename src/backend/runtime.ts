import express, { Request, Response } from 'express'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { connect } from 'mqtt'
import { access } from 'fs/promises'

const getPaths = ( string: string ) => {
	const index = 1 + string.substring( 1 ).indexOf( '/' )
	return [ string.slice( 0, index ), string.slice( index ) ].filter( n => n )
}

const http = express()

http.use( webpackHotMiddleware( ( global as any ).config, { log: false } ) )

http.get( '*', async ( req: Request, res: Response ) => {
	try {
		await access( `${process.cwd()}/dist/${req.path}` )
		if ( req.path != 'main.js' ) res.sendFile( `${process.cwd()}/dist/${req.path}` )
	} catch {
		res.sendFile( `${process.cwd()}/dist/index.html` )
	}
} )

const port = 3000

http.listen( port, () => console.log( `running on port ${port}` ) )

const network = connect( 'ws://localhost:9001' )

for ( let i in (global as any).subscribers ) network.subscribe( i )

network.on( 'message', async ( path: string, message: Buffer ) => {
	if ( (global as any).subscribers.hasOwnProperty( path ) ) {
		const response = await (global as any).subscribers[ path ]( JSON.parse( message.toString( ) ) )
		if ( response.path && response.message ) network.publish( response.path, JSON.stringify( response.message ) )
	}


	/*let forward = true

	for ( let g in ( global as any ).guards ) {
		const guard = ( global as any ).guards[ g ]
		for ( let i in guard.intercepts ) {
			forward = await guard[ guard.intercepts[ i ] ]( { path, message } )
			if ( !forward ) break
		}
	}

	const [ primary, secondary ] = getPaths( path )

	if ( ( global as any ).gateway[ primary ] ) {
		const gateway = ( global as any ).gateway[ primary ]

		if ( gateway.receptors && gateway.receptors[ secondary ] ) {

			if ( !forward ) for ( let e in gateway.exposes ) {
				if ( gateway.exposes[ e ] == gateway.receptors[ secondary ] ) {
					forward = true
					break
				}
			}

			if ( forward ) {
				const res = await gateway[ gateway.receptors[ secondary ] ]( message )
				if ( res && res.path && res.message ) socket.emit( res.path, res.message )
			}
		}
	}*/
} )

