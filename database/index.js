const mongoose = require( 'mongoose' )
require( 'reflect-metadata' )

const Schema = ( name ) => ( target ) => {
	const schema = new mongoose.Schema( target.prototype.__schema__ )
  schema.statics.read = async function( query, all = false ) { return await this[ !all ? 'findOne' : 'find' ]( query, { _id: 0, __v: 0 } ) }
  schema.statics.update = async function( query, update ) { return await this[ !all ? 'updateOne' : 'update' ]( query, update ) }
  schema.statics.delete = async function( query ) { return await this[ !all ? 'updateOne' : 'update' ]( query )  }
	;( global.__schemas__ ??= {} )[ target.name ] = mongoose.models && mongoose.models[ name ] ? mongoose.models[ name ] : mongoose.model( name, schema )
}

const Field = ( options ) => ( target, key ) => {
  ( target.__schema__ ??= {} )[ key ] = { ...options, type: Reflect.getMetadata( 'design:type', target, key ).name }
}

module.exports = { Schema, Field, Model: mongoose.Model }