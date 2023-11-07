import 'reflect-metadata'

const getIndex = ( childs: any, index: any ) => {
	let uid: string = '', last = Number( index )
	for ( let i in childs ) {
		if ( Number( i ) > last ) break
		if ( childs[ i ] instanceof HTMLElement && childs[ i ].attributes.length > 0 && childs[ i ].getAttributeNames( )[ 0 ].length == 10 ) {
			const id = childs[ i ].getAttributeNames( )[ 0 ]
			if ( uid == id ) {
				last += 1
			} else {
				uid = id
			}
		}
	}
	return last.toString( )
}

const update = ( elements: any ) => {
	for ( let id in elements ) {
		const element: any = document.querySelector( `[${id}]` )

		if ( !element ) continue

		for ( let type in elements[ id ] ) {
			if ( type == 'iteration' ) {

				for ( let index in elements[ id ][ type ] ) {

					const n: any = document.querySelectorAll( `[${index.substring( 2 )}]` )
					let prev: any, next: any
					
					if ( n.length != 0 ) {
						prev = n[ 0 ].previousElementSibling
						next = n[ n.length - 1 ].nextElementSibling
						for ( let e of n ) e.parentNode.removeChild( e )
					}

					const els = elements[ id ][ type ][ index ]()

					if ( els.length == 0 ) continue 

					if ( element.childNodes.length == 0 ) {
						for ( let e of els ) element.appendChild( e )
						continue
					}

					if ( n.length != 0 ) {
						if ( prev ) {
							for ( let e of els.reverse() ) element.insertBefore( e, prev.nextSibling )
						} else if ( next ) {
							for ( let e of els ) element.insertBefore( e, next )
						}
						continue
					}
					
					for ( let e of els.reverse() ) element.insertBefore( e, element.childNodes[ getIndex( element.childNodes, index[ 0 ] ) ] )
				}

			} else if ( type == 'attributes' ) {

				for ( let name in elements[ id ][ type ] ) element.setAttribute( name, elements[ id ][ type ][ name ]() )

			} else if ( type == 'children' ) {

				for ( let index in elements[ id ][ type ] ) element.childNodes[ getIndex( element.childNodes, index ) ].replaceWith( elements[ id ][ type ][ index ]() )	
				
			}
		}
	}
}

for ( let type of [ String, Number, Boolean, Array, Object ] ) { Object.defineProperty( type.prototype, 'q', { writable: true, value: { elements: { }, state: false, update: ( ) => {}, append: ( ) => {} } } ) }

const define = ( value: any ) => {
	value.q.elements = {}
	value.q.state = true
	value.q.update = ( ) => update( value.q.elements )
	value.q.append = ( id: string, type: string, param: any ) => { ( ( value.q.elements[ id ] ??= {} )[ type ] ??= {} )[ param.name ? param.name : param.index ] = param.value }
}

export const Gateway = ( path: string ) => {
	return ( target: any ) => {
		if ( !( global as any ).gateway ) { ( global as any ).gateway = {} }
		( global as any ).gateway[ path ] = new class extends target {
			constructor( ) {
				super()

				// ENABLE REQUESTS
				for ( let i in this.__requests__ ) ( ( global as any ).subscribers ??= {} )[ `${path}${i}` ] = this[ this.__requests__[ i ] ]

				// ENABLE EXPOSES
				for ( let r in this.__requests__ ) {
					for ( let e in this.__exposes__ ) {
						if ( this.__requests__[ r ] == this.__exposes__[ e ] ) ( ( global as any ).exposes ??= {} )[ `${path}${r}` ] = e
					}
				}

				// ENABLE DEPENDECY INJECTION
				for ( let s in ( global as any ).__services__ ) {
					for ( let i in this.__injection__ ) if ( i == s ) {
						this[ this.__injection__[ i ] ] = ( global as any ).__services__[ i ]
					}
				}

				// RUN INITIATE METHODS
				for ( let key in this.__initiate__ ) this[ this.__initiate__[ key ] ]( )
			}
		}
	}
}

export const Request = ( path: string ) => {
	return ( target: any, key: string ) => {
		if ( !target.__requests__ ) target.__requests__ = {}
		target.__requests__[ path ] = key
	}
}

export const Response = ( path: string, message: any ) => {
	return { path, message }
}

export const Broadcast = ( { clients, path, message }: any ) => {
	for ( let i in clients ) ( global as any ).publish( `${path}-${clients[ i ]}`, message )
}

export const Service = ( ) => {
	return ( target: any ) => {
		if ( !( global as any ).__services__ ) { ( global as any ).__services__ = {} }
		( global as any ).__services__[ target.name ] = new class extends target {
			constructor( ) {
				super()

				// RUN INITIATE METHODS
				for ( let key in this.__initiate__ ) this[ this.__initiate__[ key ] ]( ) 
			}
		}
	}
}

export const Inject = ( ) => {
	return ( target: any, key: string ) => {
		const { name } = Reflect.getMetadata( 'design:type', target, key )
		if ( !target.__injection__ ) target.__injection__ = {}
		target.__injection__[ name ] = key
	}
}

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

export const Guard = ( ) => {
	return ( target: any ) => {
		if ( !( global as any ).guards ) { ( global as any ).guards = {} }
		( global as any ).guards[ target.name ] = new class extends target {
			constructor( ) {
				super()
				this.intercepts = this.intercepts
			}
		}
	}
}

export const Intercept = ( ) => {
	return ( target: any, key: string ) => {
		if ( !target.intercepts ) target.intercepts = []
		target.intercepts.push( key )
	}
}

export const Expose = ( ) => {
	return ( target: any, key: string ) => {
		if ( !target.__exposes__ ) target.__exposes__ = []
		target.__exposes__.push( key )
	}
}

export const View = ( path: string ) => {
	return ( target: any ) => {
		if ( !( global as any ).views ) { ( global as any ).views = {} }
		( global as any ).views[ path ] = class View extends target {
			constructor( { attributes }: any ) {
				super()

				if ( attributes ) for ( let key in this.parameters ) this[ this.parameters[ key ] ] = attributes[ this.parameters[ key ] ]
				this.element = target.name
			}
		}
	}
}

export const Component = () => {
	return ( target: any ) => {
		const prototype = class extends target {
			constructor( data: any ) {
				super()

				// BIND METHODS
				const ignore = [ 'constructor', 'render', 'receptor', '__state__', 'properties', 'parameters', '__initiate__' ]
				Object.getOwnPropertyNames( target.prototype ).filter( item => !ignore.includes( item ) ).map( item => this[ item ] = this[ item ].bind( this ) )

				// DEFINE STATES
				for ( let key in this.__state__ ) {

					if ( this[ this.__state__[ key ] ] instanceof Array ) {
						
						const handler = { get: ( target: any, property: string ) => { if ( [ 'push', 'unshift' ].includes( property ) ) { return function( value: any ) { target.push( value ); target.q.update() } } return target[ property ] } }
						let value = new Proxy( this[ this.__state__[ key ] ], handler )
						define( value )
						Object.defineProperty( this, this.__state__[ key ], { get: () => value, set: ( v: any ) => { value = new Proxy( v, handler ); value.q.update() } } )

					} else if ( this[ this.__state__[ key ] ] instanceof Object ) {

						const handler = { set: ( target: any, property: any, value: any ) => { target[ property ] = value; target.q.update(); return true } }
						let value = new Proxy( this[ this.__state__[ key ] ], handler )
						define( value )
						Object.defineProperty( this, this.__state__[ key ], { get: () => value, set: ( v: any ) => { value = new Proxy( v, handler ); value.q.update() } } )

					} else if ( [ 'string', 'number', 'boolean' ].includes( typeof this[ this.__state__[ key ] ] ) ) {
						
						let value = this[ this.__state__[ key ] ]
						define( value )
						Object.defineProperty( this, this.__state__[ key ], { get: () => value, set: ( v: any ) => { value = v; value.q.update() } } )
					
					}
				}

				// DEFINE RECEPTORS
				if ( this.receptor ) for ( let key in this.receptor ) ( global as any ).subscribe( key, this[ this.receptor[ key ] ] )
				
				// DEFINE PROPERTIES
				if ( data.attributes ) for ( let key in this.properties ) this[ this.properties[ key ] ] = data.attributes[ this.properties[ key ] ]
				
				// RUN INITIATE METHODS
				for ( let key in this.__initiate__ ) this[ this.__initiate__[ key ] ]( ) 

				this.element = target.name
			}
		}
		const Component: any = function( props: any ) { return new prototype( props ) }
		return Component 
	}
}

export const Initiate = ( ) => {
	return ( target: any, key: string ) => {
		if ( !target.__initiate__ ) target.__initiate__ = []
		target.__initiate__.push( key )
	}
}

export const Navigate = ( path: string ) => {
	return ( global as any ).router( path )
}

export const Subscribe = ( path: string ) => {
	return ( target: any, key: string ) => {
		if ( !target.receptor ) target.receptor = {}
		target.receptor[ path ] = key
	}
}

export const Publish = ( path: string, message: any ) => {
	( global as any ).publish( path, message )
}

export const State = ( ) => {
	return ( target: any, key: string ) => {
		if ( !target.__state__ ) target.__state__ = []
		target.__state__.push( key )
	}
}

export const Parameter = ( ) => {
	return ( target: any, key: string ) => {
		if ( !target.parameters ) target.parameters = []
		target.parameters.push( key )
	}
}

export const Property = ( ) => {
	return ( target: any, key: string ) => {
		if ( !target.properties ) target.properties = []
		target.properties.push( key )
	}
}

export const Client = ( value: string ) => {
	( global as any ).client( value )
}