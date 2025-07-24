// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.30
// 

import { Schema, type, ArraySchema } from '@colyseus/schema';


export class Player extends Schema {
    @type("string") public mongoId!: string;
    @type("string") public id!: string;
    @type("string") public username!: string;
    @type([ "string" ]) public hand: ArraySchema<string> = new ArraySchema<string>();
    @type("number") public score!: number;
    @type([ "string" ]) public bids: ArraySchema<string> = new ArraySchema<string>();
    @type("boolean") public active!: boolean;
    @type("boolean") public eliminated!: boolean;
    @type("boolean") public connected!: boolean;
    @type("number") public rank!: number;
}
