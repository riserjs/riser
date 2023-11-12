
export const component = ( target: any, methods ) => class Component extends target {
	// ya no haria falta esta vaina quizas
	constructor( attributes) {
		super()

		
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

export const service = ( target: any ) => new class extends target {
	constructor( ) {
		super()

		// RUN INITIATE METHODS
		for ( let key in this.__initiate__ ) this[ this.__initiate__[ key ] ]( ) 
	}
}

export const guard = ( target: any ) => new class extends target {
	constructor( ) {
		super()
		this.intercepts = this.intercepts
	}
}

export const view = ( target: any ) => class View extends target {
	constructor( { attributes }: any ) {
		super()

		if ( attributes ) for ( let key in this.__parameters__ ) this[ this.__parameters__[ key ] ] = attributes[ this.__parameters__[ key ] ]
		this.__name__ = target.name

	}
}