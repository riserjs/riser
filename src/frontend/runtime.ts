import { connect } from 'mqtt/dist/mqtt.min'
import { random, recursivelyRemove } from '../utils'

( global as any ).storages = {}

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
		if ( id == 'properties' ) continue
		const element: any = document.querySelector( `[${id}]` )

		if ( !element ) continue

		for ( let type in elements[ id ] ) {
			if ( type == 'iteration' ) {

				for ( let index in elements[ id ][ type ] ) {

					const n: any = document.querySelectorAll( `[${index.split( '-' )[ 1 ]}]` )
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
					
					for ( let e of els.reverse() ) element.insertBefore( e, element.childNodes[ getIndex( element.childNodes, index.split( '-' )[ 0 ] ) ] )
				}

			} else if ( type == 'children' ) {

				for ( let index in elements[ id ][ type ] ) element.childNodes[ getIndex( element.childNodes, index ) ].replaceWith( elements[ id ][ type ][ index ]() )	
				
			} else if ( type == 'attributes' ) {

				for ( let name in elements[ id ][ type ] ) {
					if ( name == 'value' && element.tagName == 'INPUT' ) element.value = elements[ id ][ type ][ name ]()
					element.setAttribute( name, elements[ id ][ type ][ name ]() )
				}

			}
	
		}
	}
}

const constructor = ( { element, attributes, children } ) => {

	const uid = random( );
	( global as any ).storages[ uid ] = { instance: new element( attributes, uid ), render: undefined }

	// STORAGE REACTIVITY
	{
		( global as any ).storages[ uid ].instance.append = ( prop: string, id: string, type: string, param: any ) => { ( ( ( ( global as any ).storages[ uid ][ prop ] ??= {} )[ id ] ??= {} )[ type ] ??= {} )[ param.name ? param.name : param.index ] = param.value }
	}

	// DEFINE STATES
	{
		for ( let key in ( global as any ).storages[ uid ].instance.__states__ ) {
			let name = ( global as any ).storages[ uid ].instance.__states__[ key ], handler

			const onupdate = ( ) => {
				update( ( global as any ).storages[ uid ][ name ] )
				if ( ( global as any ).storages[ uid ][ name ]?.properties ) for ( let i in ( global as any ).storages[ uid ][ name ].properties ) ( global as any ).storages[ uid ][ name ].properties[ i ]( ( global as any ).storages[ uid ].instance[ name ] )
			}

			if ( ( global as any ).storages[ uid ].instance[ name ] instanceof Array ) {
				handler = { get: ( target: any, property: string ) => [ 'push', 'unshift' ].includes( property ) ? ( value: any ) => { target[ property ]( value ); onupdate( ) } : target[ property ] }
			} else if ( ( global as any ).storages[ uid ].instance[ name ] instanceof Object ) {
				handler = { set: ( target: any, property: any, value: any ) => { target[ property ] = value; onupdate( ); return true } }
			}

			let value = handler ? new Proxy( ( global as any ).storages[ uid ].instance[ name ], handler ) : ( global as any ).storages[ uid ].instance[ name ]

			Object.defineProperty( ( global as any ).storages[ uid ].instance, name, { get: () => value, set: v => { value = handler ? new Proxy( v, handler ) : v; onupdate( ) } } )
		}
	}

	// DEFINE PROPERTIES
	{
		for ( let property in ( global as any ).storages[ uid ].instance.__properties__ ) {
			let name = ( global as any ).storages[ uid ].instance.__properties__[ property ], handler, parent, state
			
			if ( typeof attributes[ name ] == 'function' ) { ( global as any ).storages[ uid ].instance[ name ] = attributes[ name ]; continue }
	
			if ( !attributes.hasOwnProperty( name ) ) continue

			for ( let attr in attributes ) {
				if ( attributes[ 'parent' ] ) parent = attributes[ 'parent' ]
				if ( attr.startsWith( `${name}-`) ) state = attr.split( '-' )[ 1 ]
			}

			const onupdate = ( ) => {
				if ( ( global as any ).storages[ uid ] && ( global as any ).storages[ uid ][ name ] ) update( ( global as any ).storages[ uid ][ name ] )
				if ( ( global as any ).parent && state && ( global as any ).storages[ parent ].instance[ state ] != ( global as any ).storages[ uid ].instance[ name ] ) ( global as any ).storages[ parent ].instance[ state ] = ( global as any ).storages[ uid ].instance[ name ]
			}

			if ( attributes[ name ] instanceof Array ) {
				handler = { get: ( target: any, property: string ) => [ 'push', 'unshift' ].includes( property ) ? ( value: any ) => { target[ property ]( value ); onupdate( ) } : target[ property ] }
			} else if ( attributes[ name ] instanceof Object ) {
				handler = { set: ( target: any, property: any, value: any ) => { target[ property ] = value; onupdate( ); return true } }
			}

			let value = attributes[ name ]
	
			Object.defineProperty( ( global as any ).storages[ uid ].instance, name, { get: () => value, set: v => { value = handler ? new Proxy( v, handler ) : v; onupdate( ) } } )

			if ( parent && state ) ( ( global as any ).storages[ parent ][ state ].properties ??= [] ).push( ( v => { if ( ( global as any ).storages[ uid ].instance[ name ] != v ) ( global as any ).storages[ uid ].instance[ name ] = v } ) )
		}
	}

	// DEFINE PARAMETERS
	{
		for ( let key in ( global as any ).storages[ uid ].instance.__parameters__ ) {
			let name = ( global as any ).storages[ uid ].instance.__parameters__[ key ]
			if ( attributes.hasOwnProperty( name ) ) ( global as any ).storages[ uid ].instance[ name ] = attributes[ name ]
		}
	}

	// DEFINE SUBSCRIPTIONS
	// AQUI ABAJO ESTA PARA HACER SUbSCRIBE DIRECTO
	{
		for ( let key in ( global as any ).storages[ uid ].instance.__subscriptions__ ) ( global as any ).subscribe( key, ( global as any ).storages[ uid ].instance[ ( global as any ).storages[ uid ].instance.__subscriptions__[ key ] ] )
	}

	// RENDERING
	{
		( global as any ).storages[ uid ].render = ( global as any ).storages[ uid ].instance.render( children )
	}

	// REDEFINE IDS
	{
		const recursion = ( element: HTMLElement ) => {
			const attrs = element.getAttributeNames( )
			for ( let attr of attrs ) {
				if ( attr == 'parent' ) { element.removeAttribute( attr ); continue }
				if ( attr.indexOf( '-' ) !== -1 ) { element.removeAttribute( attr ); continue }
				if ( attr.length != 10 ) continue
				for ( let prop in ( global as any ).storages[ uid ] ) {
					for ( let id in ( global as any ).storages[ uid ][ prop ] ) {
						if ( id != attr ) continue
						const newId = random( )
						element.removeAttribute( attr )
						element.setAttribute( newId, '' );
						( global as any ).storages[ uid ][ prop ][ newId ] = ( global as any ).storages[ uid ][ prop ][ id ]
						delete ( global as any ).storages[ uid ][ prop ][ id ]
					}
				}
			}
			for ( let child of element.childNodes ) {
				if ( child instanceof HTMLElement ) recursion( child )
			}
		}
		recursion( ( global as any ).storages[ uid ].render )
	}

	// RUN ONMOUNT METHOD
	{
		if ( ( global as any ).storages[ uid ].instance.onMount ) ( global as any ).storages[ uid ].instance.onMount( )
	}

	// DEBUGING PURPUSES
	{
		( global as any ).storages[ uid ].render.setAttribute( ( global as any ).storages[ uid ].instance.__name__, '' )
	}

	// RUN ONUNMOUNT AND CLEAN UP
	{
		setTimeout( ( ) => {
			new MutationObserver( function ( ) {
				if ( !document.body.contains( ( global as any ).storages[ uid ].render ) ) {
					if ( ( global as any ).storages[ uid ].instance?.onUnmount ) ( global as any ).storages[ uid ].instance.onUnmount( )
					delete ( global as any ).storages[ uid ];
					this.disconnect( )
				}
			} ).observe( ( global as any ).storages[ uid ].render.parentElement, { childList: true } )
		} )
	}

	return ( global as any ).storages[ uid ].render
}

const addAttributes = ( elem: any, attrs: any ) => {
	if ( attrs === null || attrs === undefined ) attrs = {}
	for ( let [ attr, value ] of Object.entries( attrs ) ) {
		if ( value === true ) elem.setAttribute( attr, attr )
		else if ( attr.startsWith( 'on' ) && typeof value === 'function' ) {
			elem.addEventListener( attr.substr( 2 ).toLowerCase(), value )
		} else if ( value !== false && value !== null && value !== undefined ) {
			if ( value instanceof Object ) {
				const modifier = attr === 'style' ? ( str: string ) => str.replace( /([a-z0-9])([A-Z])/g, '$1-$2' ).toLowerCase() : ( str: string ) => str.toLowerCase()
				value = Object.entries( value ).map( ( [ key, val ] ) => `${modifier( key )}: ${val}` ).join( '; ' )
			}
			if ( attr === 'className' && value !== '' ) {
				const values = value?.toString().trim().split( ' ' )
				for ( let v in values ) {
					elem.classList.add( v )
				}
			}
				
			else elem.setAttribute( attr, value?.toString() )
		}
	}
}

const appendChild = ( elem: any, children: any ) => {
	if ( !children || children === undefined ) return
	if ( children instanceof Array ) {
		children.map( child => appendChild( elem, child ) )
		return
	}
	let child = children
	if ( !( child instanceof Node ) ) child = document.createTextNode( child.toString() )
	elem.appendChild( child )
}

const createElement = ( elem: any, attributes: any, ...children: any ) => {
	if ( typeof elem === 'function' ) {
		if ( elem.name !== 'Fragment' ) {
			return constructor( { element: elem, attributes, children } )
		} else {
			return elem( { children } ) 
		}
	} else {
		const element = document.createElement( elem )
		addAttributes( element, attributes )
		for ( let child of children ) appendChild( element, child )
		return element
	}
}

const Fragment = ( { children }: any ) => {
	const element = document.createElement( 'fragment' )
	for ( const child of children ) appendChild( element, child )
	return element
}

( global as any ).jsx = { Fragment, createElement }

const getUrlParams = () => Object.fromEntries( new URLSearchParams( location.search ) )

declare var broker: any

const network = connect( `ws://${location.hostname}:${broker.port}`, { username: broker.username, password: broker.password } );

let client = localStorage.getItem( 'client' ) ? localStorage.getItem( 'client' ) : Math.random().toString( 36 ).slice( -9 )

const backup: any = {}
let subscribers: any = {};

( global as any ).client = ( value: string ) => {
	if ( localStorage.getItem( 'client' ) == value ) return
	localStorage.setItem( 'client', value )

	for ( let i in subscribers ) network.unsubscribe( i )
	subscribers = {}

	for ( let i in backup ) {
		subscribers[ `${i}-${value}` ] = backup[ i ]
		network.subscribe( `${i}-${value}` )
	}
}

network.on( 'message', ( path: string, message: any ) => {
	if ( subscribers.hasOwnProperty( path ) ) subscribers[ path ]( JSON.parse( message.toString( ) ) )
} );

( global as any ).subscribe = ( path: string, callback: any ) => {
	backup[ path ] = callback
	subscribers[ `${path}-${client}` ] = callback
	network.subscribe( `${path}-${client}` )
}

( global as any ).publish = ( path: string, message: any ) => {
	network.publish( path, JSON.stringify( { client, message } ) )
}

window.onpopstate = ( ) => {
	const Element = ( global as any ).views[ location.pathname ]
	document.body.replaceChildren( ( global as any ).jsx.createElement( Element, getUrlParams( ), null ) )
}

( global as any ).router = ( path: string ) => {
	let Element: any, l: string
	for ( let i in ( global as any ).views ) if ( path.startsWith( i ) && i != '/' ) {
		Element = ( global as any ).views[ i ]
	}
	if ( !Element ) {
		Element = ( global as any ).views[ '/' ]
		l = `${location.origin}/`
	} else {
		l = `${location.origin}${path}`
	}
	history.pushState( {}, '', l )
	recursivelyRemove( document.body.firstChild )
	document.body.append( ( global as any ).jsx.createElement( Element, getUrlParams( ), null ) )
}

( global as any ).main = ( ) => {
	let Element = ( global as any ).views[ location.pathname ]
	if ( !Element ) {
		Element = ( global as any ).views[ '/' ]
		history.pushState( {}, '', location.origin + '/' )
	}
	document.body.replaceChildren( ( global as any ).jsx.createElement( Element, getUrlParams( ), null ) )
}

( global as any ).main( )

const log = console.log
console.log = function( ...args ) {
	log.call( this, ...args.map( v => {
		if ( v instanceof Array ) return [ ...v ]
		else if ( v instanceof Object ) return { ...v }
		else return v
	} ) )
}


