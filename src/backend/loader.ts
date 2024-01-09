declare var __non_webpack_require__: any
let bcontext: any

const bmain = () => {
	bcontext = __non_webpack_require__.context( `${__dirname}/../../../../src`, true, /\.(gateway|guard|service|model|schema).(js|ts)?$/ )
	bcontext.keys().reverse().map( ( file ) => bcontext( file ) )
}

bmain( )

if ( ( module as any ).hot ) {
	( module as any ).hot.accept( fcontext.id, () => {
		bmain( )
	} )
}
