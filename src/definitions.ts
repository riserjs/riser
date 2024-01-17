export const component = ( target: any, methods ) => class Component extends target {
	constructor( attributes, uid ) {
		super()

		this.id = uid
		// BIND METHODS
		{
			for ( let i in methods ) this[ methods[ i ] ] = this[ methods[ i ] ].bind( this )
		}

		// DEBUGING PURPUSES
		{
			this.__name__ = target.name
		}

	}
}

export const gateway = ( path: string, target: any ) => new class extends target {
	constructor( ) {
		super()

		// ENABLE SUBSCRIBERS
		{
			for ( let i in this.__requests__ ) this[ this.__requests__[ i ] ] = this[ this.__requests__[ i ] ].bind( this )
			for ( let i in this.__requests__ ) ( global.subscribers ??= {} )[ `${path}${i}` ] = this[ this.__requests__[ i ] ]
		}

		// ENABLE EXPOSES
		{
			for ( let r in this.__requests__ ) {
				for ( let e in this.__exposes__ ) {
					if ( this.__requests__[ r ] == this.__exposes__[ e ] ) ( global.exposes ??= {} )[ `${path}${r}` ] = e
				}
			}
		}

		// INJECT DEPENDECY
		{
			for ( let i in this.__injection__ ) {
				for ( let s in global.__services__ ) if ( i == s ) this[ this.__injection__[ i ] ] = global.__services__[ i ]
				for ( let s in global.__schemas__ ) if ( i == s ) this[ this.__injection__[ i ] ] = global.__schemas__[ i ]
			}
		}

		if ( this.onBoot ) this.onBoot( )
	}
}

export const service = ( target: any ) => new class extends target {
	constructor( ) {
		super()
	}
}

export const storage = ( target: any ) => new class extends target {
	constructor( ) {
		super()

		// DEFINE STORAGES
		{
			for ( let name of Object.getOwnPropertyNames( this ) ) {
				if ( [ 'clear', 'onchange' ].includes( name ) ) continue
				let handler, value
				//console.log( `${target.name.toLowerCase()}-${name}` )

				const onupdate = ( ) => {
					localStorage.setItem( `${target.name}-${name}`, JSON.stringify( this[ name ] ) )
				}

				if ( localStorage.getItem( `${target.name}-${name}` ) ) this[ name ] = JSON.parse( localStorage.getItem( `${target.name}-${name}` ) )

				if ( this[ name ] instanceof Array ) {
					handler = { get: ( target: any, property: string ) => {
						if ( [ 'push', 'unshift', 'pop', 'shift', 'splice' ].includes( property ) ) return ( value: any ) => { target[ property ]( value ); onupdate( ) }
						return target[ property ]
					} }
				} else if ( this[ name ] instanceof Object ) {
					handler = { set: ( target: any, property: any, value: any ) => { target[ property ] = value; onupdate( ); return true } }
				}

				value = handler ? new Proxy( this[ name ], handler ) : this[ name ]

				Object.defineProperty( this, name, { get: () => value, set: v => { value = handler ? new Proxy( v, handler ) : v; onupdate( ) } } )
			}
		}

	}
}

export const guard = ( target: any ) => new class extends target {
	constructor( ) {
		super()
		
		this.intercepts = this.intercepts
	}
}

export const view = ( target: any ) => class View extends target {
	constructor( { attributes }: any, uid ) {
		super()

		this.id = uid
		this.__name__ = target.name
	}
}