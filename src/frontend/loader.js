let context

const load = () => {
	context = require.context( `${__dirname}/../../../../src`, true, /\.(view|component|storage).(jsx|tsx|js|ts)?$/  )
	context.keys().map( ( file ) => context( file ) )
}

load()

if ( module.hot ) {
	module.hot.accept( context.id, ( ) => {
		load()
		global.main()
		//global.restart()
	} )
}

// import.meta.webpackContext( `${__dirname}/../../../src`, { recursive: true, regExp: /\.(view).(jsx|tsx)?$/ } )