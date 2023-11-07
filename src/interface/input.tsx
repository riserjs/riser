import { Component, Property } from '../core'

@Component( )
export class Input {

	@Property( )
	placeholder: string

	@Property( )
	value: string

	render( ) {		
  	return (
			<input
				type="text"
				placeholder={ this.placeholder }
				class="py-2 px-2 text-md border focus:outline-none rounded"
				//value={ this.value }
				onKeyUp={ ( event: any ) => this.value = event.target.value }
			/>
  	)
	}
}