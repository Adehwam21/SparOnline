// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.30
// 

import { Schema, type, ArraySchema } from '@colyseus/schema';
import { ChatMessage } from './ChatMessage'

export class ChatRoom extends Schema {
    @type([ ChatMessage ]) public messages: ArraySchema<ChatMessage> = new ArraySchema<ChatMessage>();
}
