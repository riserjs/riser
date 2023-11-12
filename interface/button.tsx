import { Component, Property, State } from 'riser'

@Component( )
export class Button {

	@State()
	x: string = ''

	@Property( )
	label: string

	@Property( )
	onClick: any

	render( ) {
		//setTimeout( ()=> this.label ='abcdefghijklmnopqrstuvwxyz'[ Math.floor( Math.random( ) * 26 ) ], Math.random() * 6000 )
  	return (
  		<div
				class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-max"
				onClick={ this.onClick }
			>
				{ this.label }
  		</div>
  	)
	}
}