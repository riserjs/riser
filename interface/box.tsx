// @ts-ignore
import { Component, Property, Children } from '../../riser'

@Component( )
export class Box {

	@Property( )
	height: string = '100%'

	@Property( )
	width: string = '100%'

	@Property( )
	vertical: string

	@Property( )
	horizontal: string

	@Property( )
	color: string = 'white'

	render( children: Children ) {
		return (
  		<div style={ {
				height: this.height,
				width: this.width,
				margin: 0,
				padding: 0,
				display: 'flex',
				flexDirection: 'column',
				color: 'white',
				backgroundColor: this.color,
				alignItems: this.vertical == 'middle' ? 'center' : this.vertical == 'end' ? 'end' : 'start',
				justifyContent: this.horizontal == 'middle' ? 'center' : this.horizontal == 'end' ? 'end' : 'start'
			} }>
				{ children }
  		</div>
  	)
	}

}
