// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.30
// 

import { Schema, type } from '@colyseus/schema';


export class Payouts extends Schema {
    @type("string") public userId!: string;
    @type("number") public amount!: number;
}
