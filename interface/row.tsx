// @ts-ignore
import { Component, Property, Children } from '../../riser'

@Component( )
export class Row {

	@Property( )
	height: string = '0px'

	@Property( )
	space: string = '0px'

	@Property( )
	align: string

	render( children: Children ) {
		return (
  		<div style={ {
				display: 'flex',
				flexDirection: 'row',
				width: '100%',
				height: this.height,
				gap: this.space,
				justifyContent: this.align == 'middle' ? 'center' : this.align == 'end' ? 'end' : this.align == 'between' ? 'space-between' : this.align == 'around' ? 'space-around' : this.align == 'evenly' ? 'space-evenly' : 'start'
			} }>
				{ children }
  		</div>
  	)
	}

}
