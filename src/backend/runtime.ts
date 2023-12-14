import { connect as Mqtt } from 'mqtt'
import { connect as Mongodb } from 'mongoose';

declare var config: any

const network = Mqtt( `ws://${config.mqtt.host}:${config.mqtt.port}`, { username: config.mqtt.username, password: config.mqtt.password } );

const database = Mongodb( `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}/${config.appname}?authSource=admin` );

( global as any ).publish = ( path: string, message: any ) => network.publish( path, JSON.stringify( message ) )

for ( let i in ( global as any ).subscribers ) network.subscribe( i )

network.on( 'message', async ( path: string, buffer: Buffer ) => {
	
	const { client, message } = JSON.parse( buffer.toString( ) )

	let forward = true

	if ( !( global as any ).exposes.hasOwnProperty( path ) ) {
		for ( let i in ( global as any ).guards ) {
			const guard = ( global as any ).guards[ i ]
	
			for ( let j in guard.intercepts ) {
				forward = await guard[ guard.intercepts[ j ] ]( { client, path, message } )
				if ( !forward ) break
			}
		}
	}

	if ( ( global as any ).subscribers.hasOwnProperty( path ) && forward ) {
		const response = await ( global as any ).subscribers[ path ]( { client, message } )
		if ( response ) network.publish( `${response.path}-${client}`, JSON.stringify( response.message ) )
	}

} );

( global as any ).disconnect = ( ) => network.end()