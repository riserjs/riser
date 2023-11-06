import { connect } from 'mqtt'

declare var broker: any

const network = connect( `ws://${broker.ip}:${broker.port}`, { username: broker.username, password: broker.password } );

( global as any ).publish = ( path: string, { client, message }: any ) => network.publish( `${path}-${client}`, JSON.stringify( message ) )

for ( let i in ( global as any ).subscribers ) network.subscribe( i )

network.on( 'message', async ( path: string, buffer: Buffer ) => {

	const { client, message } = JSON.parse( buffer.toString( ) )

	let forward = true

	for ( let i in ( global as any ).guards ) {
		const guard = ( global as any ).guards[ i ]

		for ( let j in guard.intercepts ) {
			forward = await guard[ guard.intercepts[ j ] ]( { path, message } )
			if ( !forward ) break
		}
	}

	//falta exposed

	if ( ( global as any ).subscribers.hasOwnProperty( path ) && forward ) {
		const response = await ( global as any ).subscribers[ path ]( { client, message } )
		if ( response ) network.publish( `${response.path}-${response.client}`, JSON.stringify( response.message ) )
	}

} );

( global as any ).disconnect = ( ) => network.end()