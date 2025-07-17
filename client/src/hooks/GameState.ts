// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.30
// 

import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';
import { Player } from './Player'
import { Round } from './Round'

export class GameState extends Schema {
    @type("string") public roomId!: string;
    @type("number") public maxPlayers!: number;
    @type("number") public maxPoints!: number;
    @type("string") public creator!: string;
    @type("string") public variant!: string;
    @type("string") public gameMode!: string;
    @type("string") public gameName!: string;
    @type([ "string" ]) public playerUsernames: ArraySchema<string> = new ArraySchema<string>();
    @type([ "string" ]) public deck: ArraySchema<string> = new ArraySchema<string>();
    @type({ map: Player }) public players: MapSchema<Player> = new MapSchema<Player>();
    @type([ Round ]) public rounds: ArraySchema<Round> = new ArraySchema<Round>();
    @type("number") public nextPlayerIndex!: number;
    @type("string") public roundStatus!: string;
    @type("string") public gameStatus!: string;
    @type("string") public gameWinner!: string;
}
