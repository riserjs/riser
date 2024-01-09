const mongoose = require( 'mongoose' )
require( 'reflect-metadata' )

const Schema = ( name ) => ( target ) => { ( global.__schemas__ ??= {} )[ name ] = mongoose.models && mongoose.models[ name ] ? mongoose.models[ name ] : mongoose.model( name, new mongoose.Schema( target.prototype.__schema__ ) ) }
const Field = ( options ) => ( target, key ) => { ( target.__schema__ ??= {} )[ key ] = { ...options, type: Reflect.getMetadata( 'design:type', target, key ).name } }

class Model extends mongoose.Model {
	async create( query ) {
		return await super.create( query )
	}
	async read( query ) {
    return await super.findOne( query )
	}
	async update( query, values ) {
    return await super.updateOne( query, values )
	}
	async delete( query ) {
    return await super.deleteOne( query )
	}
}

module.exports = { Schema, Field, Model }