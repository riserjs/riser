const update = ( elements: any ) => {
	for ( let id in elements ) {
		const { attributes, children, condition, iteration } = elements[ id ]
		const element: any = document.querySelectorAll( `[${id}]` )

		console.log(element)
		if ( element.length == 0 ) return

		for ( let name in attributes ) element[ 0 ].setAttribute( name, attributes[ name ]() )
		for ( let index in children ) {
			if ( !element[ 0 ].childNodes[ index ].nodeValue ) {
				element[ 0 ].childNodes[ index ].replaceWith( children[ index ]() )
			} else {
				element[ 0 ].childNodes[ index ].nodeValue = children[ index ]() 
			}
		}

		for ( let index in condition ) element[ 0 ].replaceWith( condition[ index ]() )
		if ( iteration ) {
			const parent = element[ 0 ].parentNode
			const prev = element[ 0 ].previousElementSibling
			const next = element[ element.length - 1 ].nextElementSibling

			for ( let e of element ) parent.removeChild( e )
			const els = iteration[ 0 ]()
			if ( prev ) {
				for ( let e of els.reverse() ) parent.insertBefore( e, prev.nextSibling )
			} else if ( next ) {
				for ( let e of els ) parent.insertBefore( e, next )
			} else {
				for ( let e of els ) parent.appendChild( e )
			}
		}
	}
} 

for ( let type of [ String, Number, Boolean, Array, Object ] ) {
	Object.defineProperty( type.prototype, 'q', {
		writable: true, value: {
			elements: {},
			state: false,
			update: () => update( type.prototype.q.elements ),
			append: ( id: string, t: string, param: any ) => { ( ( type.prototype.q.elements[ id ] ??= {} )[ t ] ??= {} )[ param.name ? param.name : param.index ] = param.value }
		}
	} )
}

Object.defineProperty( Array.prototype, 'isEmpty', { value: () => Array.prototype.length == 0 ? false : true } )
Object.defineProperty( Object.prototype, 'isEmpty', { value: () => Object.keys( Object.prototype ).length == 0 ? false : true } )

export const Gateway = ( path: string ) => {
	return ( target: any ) => {
		if ( !( global as any ).gateway ) { ( global as any ).gateway = {} }
		( global as any ).gateway[ path ] = new class extends target {
			constructor( ) {
				super()
				this.exposes = this.exposes
				for ( let i in this.__requests__ ) ( global.subscribers ??= {} )[ `${path}${i}` ] = this[ this.__requests__[ i ] ]
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

export const Broadcast = ( path: string, data: any ) => {
	( global as any ).broadcast( path, data )
}

export const Database = ( ) => {
	return ( target: any ) => {
		if ( !( global as any ).databases ) { ( global as any ).databases = {} }
		( global as any ).databases[ target.name ] = new class extends target {
			constructor( ) {
				super()

				// RUN ONINIT METHODS
				for ( let key in this.__initiate__ ) this[ this.__initiate__[ key ] ]( ) 
			}
		}
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
		if ( !target.exposes ) target.exposes = []
		target.exposes.push( key )
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
					this[ this.__state__[ key ] ].q.state = true
					if ( this[ this.__state__[ key ] ] instanceof Array ) {
						
						const handler = { get: ( target: any, property: string ) => { if ( [ 'push' ].includes( property ) ) { return function( value: any ) { target.push( value ); target.q.update() } } return target[ property ] } }
						let value = new Proxy( this[ this.__state__[ key ] ], handler )
						Object.defineProperty( this, this.__state__[ key ], { get: () => value, set: ( v: any ) => { value = new Proxy( v, handler ); value.q.update() } } )

					} if ( this[ this.__state__[ key ] ] instanceof Object ) {

						const handler = { set: ( target: any, property: any, value: any ) => { target[ property ] = value; target.q.update(); return true } }
						let value = new Proxy( this[ this.__state__[ key ] ], handler )
						Object.defineProperty( this, this.__state__[ key ], { get: () => value, set: ( v: any ) => { value = new Proxy( v, handler ); value.q.update() } } )

					} else if ( [ 'string', 'number', 'boolean' ].includes( typeof this[ this.__state__[ key ] ] ) ) {
						let value = this[ this.__state__[ key ] ]
						Object.defineProperty( this, this.__state__[ key ], { get: () => value, set: ( v: any ) => { value = v; value.q.update() } } )
					}
				}

				// DEFINE RECEPTORS
				if ( this.receptor ) for ( let key in this.receptor ) {
					//try {
					//( global as any ).ws.off( key )
					//} catch { }
					( global as any ).subscribe( key, this[ this.receptor[ key ] ] )
				}

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

export const Receptor = ( path: string ) => {
	return ( target: any, key: string ) => {
		if ( !target.receptor ) target.receptor = {}
		target.receptor[ path ] = key
	}
}

export const Emitter = ( path: string, message: any ) => {
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