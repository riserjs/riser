import { Component, Property } from '../core'

@Component( )
export class Button {

	@Property( )
	label: string

	@Property( )
	onClick: any

	render( ) {
  	return (
  		<button
				class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				onClick={ this.onClick }>
				{ this.label }
  		</button>
  	)
	}
}