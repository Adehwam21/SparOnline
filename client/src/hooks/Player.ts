// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.30
// 

import { Schema, type, ArraySchema } from '@colyseus/schema';


export class Player extends Schema {
    @type("string") public id!: string;
    @type("string") public username!: string;
    @type([ "string" ]) public hand: ArraySchema<string> = new ArraySchema<string>();
    @type("number") public score!: number;
    @type("boolean") public active!: boolean;
}
