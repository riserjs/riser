// @ts-ignore
import { Component, Property } from '../../riser'

@Component( )
export class Input {

	@Property( )
	placeholder: String = ''

	@Property( )
	value: String = ''

	render( ) {
  	return (
			<input
				type={ 'text' }
				placeholder={ this.placeholder }
				class={ 'py-100 px-2 text-md border focus:outline-none rounded' }
				value={ this.value }
				oninput={ ( event: any ) => this.value = event.target.value }
			/>
  	)
	}
}