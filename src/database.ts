import 'reflect-metadata'
import mongoose from 'mongoose'

export const Schema = ( ) => ( target: any ) => {
  ( global.__schemas__ ??= {} )[ target.name ] = new Repository( target.name, target.prototype.__schema__ )
 // ;( global.__schemas__ ??= {} )[ target.name ] = mongoose.models && mongoose.models[ target.name ] ? mongoose.models[ target.name ] : mongoose.model( target.name, new mongoose.Schema( target.prototype.__schema__ ) )
  /*schema.statics.read = async function( query: any ) { return await this.findOne( query ) }
  schema.statics.update = async function( query: any, update: any ) { return await this.updateOne( query, update ) }
  schema.statics.delete = async function( query: any ) { return await this.deleteOne( query ) }
  const m: mongoose.Model < any > = mongoose.models && mongoose.models[ target.name ] ? mongoose.models[ target.name ] : mongoose.model( target.name, schema )
  ;( global.__schemas__ ??= {} )[ target.name ] = m
  console.log( target.name, m, m.constructor.name )*/
}

export const Field = ( options?: any ) => ( target: any, key: string ) => {
  ( target.__schema__ ??= {} )[ key ] = { ...options, type: Reflect.getMetadata( 'design:type', target, key ).name }
}

export interface Model < T > extends mongoose.Model < any > {
  create( query: any )
	read?( query: any ): void
	update?( query: any, update ): void
	delete?( query: any ): void
}

export class Repository {
	private Model: mongoose.Model < any >
	constructor( name, schema ) {
		//this.Model = 
    const x = mongoose.models && mongoose.models[ 'WoodSchema' ] ? mongoose.models[ 'WoodSchema' ] : mongoose.model( 'WoodSchema', new mongoose.Schema( {x: { type: String } } ) )
    console.log(name,schema,x)
    //const x = new this.Model()
    console.log(x.findOne({x:'1'}))
	}
	async create( query: any ) {
    try {
      //console.log('create',this.Model)
      //await this.Model.create( { x: '123' } )
		} catch { console.log('x') }
	}
}