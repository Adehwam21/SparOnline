// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.30
// 

import { Schema, type } from '@colyseus/schema';


export class PlayedCard extends Schema {
    @type("string") public playerName!: string;
    @type("string") public cardName!: string;
    @type("string") public rank!: string;
    @type("string") public suit!: string;
    @type("number") public value!: number;
    @type("number") public point!: number;
    @type("number") public bidIndex!: number;
}
