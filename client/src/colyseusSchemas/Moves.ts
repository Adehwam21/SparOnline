// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.30
// 

import { Schema, type, ArraySchema } from '@colyseus/schema';
import { PlayedCard } from './PlayedCard'

export class Moves extends Schema {
    @type([ PlayedCard ]) public bids: ArraySchema<PlayedCard> = new ArraySchema<PlayedCard>();
    @type("string") public moveWinner!: string;
}
