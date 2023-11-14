export const random = () => 'abcdefghijklmnopqrstuvwxyz'[ Math.floor( Math.random( ) * 26 ) ] + Math.random( ).toString( 36 ).slice( -9 )

export const recursivelyRemove = ( node: Node ) => { while ( node.hasChildNodes( ) ) recursivelyRemove( node.firstChild ); node.parentNode.removeChild( node ) }