import 'reflect-metadata'
import { component, gateway, service, guard, view, storage } from './definitions'

// INTERFACE
export const View = ( path: string ) => ( target: any ) => ( global.views ??= {} )[ path ] = view( target )

export const Parameter = ( ) => ( target: any, key: string ) => { ( target.__parameters__ ??= [] ).push( key ) }

export const Component = ( ) => ( target: any ) => component( target, Object.getOwnPropertyNames( target.prototype ).filter( item => ![ 'constructor', 'render', '__subscriptions__', '__states__', '__properties__', '__observables__', '__injection__' ].includes( item ) ) )

export const State = ( ) => ( target: any, key: string ) => { ( target.__states__ ??= [] ).push( key ) }

export const Property = ( ) => ( target: any, key: string ) => { ( target.__properties__ ??= [] ).push( key ) }

// NETWORK
export const Gateway = ( path: string ) => ( target: any ) => { ( global.gateway ??= {} )[ path ] = gateway( path, target ) }

export const Request = ( path: string ) => ( target: any, key: string ) => { ( target.__requests__ ??= {} )[ path ] = key }

export const Response = ( path: string, message: any ) => { return { path, message } }

export const Guard = ( ) => ( target: any ) => ( global.guards ??= {} )[ target.name ] = guard( target )

export const Intercept = ( ) => ( target: any, key: string ) => { ( target.intercepts ??= [] ).push( key ) }

export const Expose = ( ) => ( target: any, key: string ) => { ( target.__exposes__ ??= [] ).push( key ) }

export const Subscribe = ( path: string ) => ( target: any, key: string ) => { ( target.__subscriptions__ ??= {} )[ path ] = key }

export const Publish = ( path: string, message: any ) => global.publish( path, message )

export const Broadcast = ( { clients, path, message }: any ) => { for ( let i in clients ) global.publish( `${path}-${clients[ i ]}`, message ) }

export const Client = ( value: string ) => global.client( value )

// UTILITY
export const Navigate = ( path: string ) => global.router( path )

export const Logger = ( type?: string ) => {
	const green = ( value: any ) => `\x1b[32m${value}\x1b[0m`
	const yellow = ( value: any ) => `\x1b[33m${value}\x1b[0m`
	const blue = ( value: any ) => `\x1b[34m${value}\x1b[0m`
	if ( ![ undefined, 'in', 'out' ].includes( type ) ) console.log( type )
	return ( { constructor: { name } }: any, key: string, descriptor: PropertyDescriptor ) => {
		const method = descriptor.value
		descriptor.value = async function ( ...args: any ) {
			if ( [ undefined, 'in' ].includes( type ) ) console.log( `${green( name )} ${yellow( key )} ${blue( 'In' )}`, args[ 0 ] )
			const res = method.apply( this, args )
			if ( [ undefined, 'out' ].includes( type ) ) {
				if ( res instanceof Promise ) {
					res.then( ( res: any ) => console.log( `${green( name )} ${yellow( key )} ${blue( 'Out' )}`, res ) )
				} else {
					console.log( `${green( name )} ${yellow( key )} ${blue( 'Out' )}`, res )
				}
			}
			return res
		}
		return descriptor
	}
}

export const Service = ( ) => ( target: any ) => { ( global.__services__ ??= {} )[ target.name ] = service( target ) }

export const Storage = ( ) => ( target: any ) => { ( global.__storages__ ??= {} )[ target.name ] = storage( target ) }

export const Inject = ( ) => ( target: any, key: string ) => { ( target.__injection__ ??= {} )[ Reflect.getMetadata( 'design:type', target, key ).name ] = key }

export const Observable = ( ) => ( target: any, key: string ) => { ( target.__observables__ ??= [] ).push( key ) }
