// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.30
// 

import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';
import { Moves } from './Moves'
import { PlayedCard } from './PlayedCard'

export class Round extends Schema {
    @type("number") public roundNumber!: number;
    @type({ map: Moves }) public moves: MapSchema<Moves> = new MapSchema<Moves>();
    @type([ PlayedCard ]) public winningCards: ArraySchema<PlayedCard> = new ArraySchema<PlayedCard>();
    @type("string") public roundWinner!: string;
    @type("string") public roundStatus!: string;
}
