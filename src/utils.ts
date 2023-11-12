export const random = () => 'abcdefghijklmnopqrstuvwxyz'[ Math.floor( Math.random( ) * 26 ) ] + Math.random( ).toString( 36 ).slice( -9 )
