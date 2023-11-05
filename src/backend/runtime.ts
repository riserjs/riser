import { connect } from 'mqtt'

declare var broker: any

const network = connect( `ws://${broker.ip}:${broker.port}`, { username: broker.username, password: broker.password } );

( global as any ).publish = ( path: string, { client, message }: any ) => network.publish( `${path}-${client}`, JSON.stringify( message ) )

for ( let i in ( global as any ).subscribers ) network.subscribe( i )

network.on( 'message', async ( path: string, buffer: Buffer ) => {

	const { client, message } = JSON.parse( buffer.toString( ) )
	if ( ( global as any ).subscribers.hasOwnProperty( path ) ) {
		const response = await ( global as any ).subscribers[ path ]( { client, message } )
		if ( response ) network.publish( `${response.path}-${response.client}`, JSON.stringify( response.message ) )
	}

} );

( global as any ).disconnect = ( ) => network.end()