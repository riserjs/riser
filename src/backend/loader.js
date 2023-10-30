let context

const load = () => {
	context = require.context( `${__dirname}/../../../../src`, true, /\.(gateway|guard|database).(js|ts)?$/ )
	context.keys().map( ( file ) => context( file ) )
}

load()

if ( module.hot ) {
	module.hot.accept( context.id, () => {
		load( )
	} )
}

// import.meta.webpackContext( `${__dirname}/../../../src`, { recursive: true, regExp: /\.(view).(jsx|tsx)?$/ } )