declare var __non_webpack_require__: any
let fcontext: any

const fmain = () => {
	fcontext = __non_webpack_require__.context( `${__dirname}/../../../../src`, true, /\.(view|component|storage).(jsx|tsx|js|ts)?$/ )
	fcontext.keys().map( ( file ) => fcontext( file ) )
}

fmain( )

if ( ( module as any ).hot ) {
	( module as any ).hot.accept( fcontext.id, () => {
		fmain( );
		( global as any ).main()
	} )
}
