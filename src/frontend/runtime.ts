import { connect } from 'mqtt/dist/mqtt.min'

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
		if ( elem.name === 'Fragment' ) { 
			// fragment
			return elem( { children } ) 
		} else {
			// view && component
			const element = document.createElement( 'div' )
			const c = new elem( { attributes, element, children } )
			element.setAttribute( `${c.element}`, '' )
			element.appendChild( c.render( children ) )
			return element
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

let client = localStorage.getItem( 'client' ) ?  localStorage.getItem( 'client' ) : Math.random().toString( 36 ).slice( -9 )

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
	let Element: any
	let l: string
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
	document.body.replaceChildren( ( global as any ).jsx.createElement( Element, getUrlParams( ), null ) )
}

( global as any ).main = () => {
	let Element = ( global as any ).views[ location.pathname ]
	if ( !Element ) {
		Element = ( global as any ).views[ '/' ]
		history.pushState( {}, '', location.origin + '/' )
	}
	document.body.replaceChildren( ( global as any ).jsx.createElement( Element, getUrlParams( ), null ) )	
}

( global as any ).main()

const log = console.log
console.log = function( ...args ) {
	log.call( this, ...args.map( ( arg ) => {
		if ( arg instanceof Array ) return [ ...arg ]
		return arg
	} ) )
}

