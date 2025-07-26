import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Player {
  mongoId: string;
  id: string; // Unique identifier for the player (session ID)
  userId: string;
  username: string;
  score: number;
  rating: number;
  hand: string[]; // Each player's hand (cards)
  bids: string[];
  active: boolean; // Indicates if the player is active in the game
  eliminated: boolean;
  connected:boolean;
}

interface Message {
  sender: string | null, 
  content: string | null, 
  time: string | null
}
interface Chatroom {
  messages: [{sender: string | null, content: string | null, time: string | null}] | null
}

// interface Payout {
//   userId: string;
//   amount: number;
// } 

export interface GameState {
  roomInfo: {
    roomUUID: string | null
    roomId: string | null; // Unique identifier for the room
    colyseusRoomId: string | null;
    maxPlayers: number | null;
    maxPoints: string | null; // Maximum points to win the game
    creator: string | null; // Creator of the game
    gameName: string | null;
    playerUsernames: string[] | null;
    variant: string | null; // Type of game (e.g., "race", "custom")
    prizePool: number| null;
    entryFee: number | null;
    roomType: number | null;
    deck: string[] | null
    bids: { playerUsername: string; cards: string[] }[]; // Bids made by players
    currentTurn: string | null;
    leadingCard: { playerUsername: string; card: string }| null; // Leading card in the current round
    players: Player[]; // List of players
    rounds: [] | null; // Current round
    nextPlayerIndex: number | null;
    roundStatus: string | null;
    gameStatus: string | null;
    gameWinner: string | null;
    chat: Chatroom | null;
    // payouts: Payout[] | null;
  } | null,
  colyseusRoomId: string | null; // ID of the Colyseus room
  roomLink: string | null;

}

const initialState: GameState = {
  roomInfo: {
    roomUUID: null,
    roomId: null,
    colyseusRoomId: null,
    gameName: null,
    maxPlayers: null,
    prizePool: null,
    deck: null,
    bids: [],
    variant: null,
    entryFee: null,
    roomType: null,
    chat: null,
    leadingCard: null,
    currentTurn: null,
    players: [],
    playerUsernames: [],
    rounds: [],
    nextPlayerIndex: null,
    roundStatus: null,
    gameStatus: null,
    creator: null,
    gameWinner: null,
    maxPoints: null, // Maximum points to win the game
    // payouts: null,
  },
  colyseusRoomId: null,
  roomLink: null,
  
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {

    setGameState : (state, action: PayloadAction<GameState>) => {
      state.roomInfo = action.payload.roomInfo;
      state.colyseusRoomId = action.payload.colyseusRoomId;
      state.roomLink = action.payload.roomLink;
    },

    updateRoomInfo: (state, action: PayloadAction<GameState>) => {
      state.roomInfo = action.payload.roomInfo;
    },

    addBid: (state, action: PayloadAction<{ playerUsername: string; cards: string[] }>) => {
      state!.roomInfo!.bids.push(action.payload);
    },

    setCurrentTurn: (state, action: PayloadAction<string>) => {
      state.roomInfo!.currentTurn = action.payload;
    },

    // setPayouts: (state, action: PayloadAction<Payout[]>) => {
    //   if (state.roomInfo) {
    //     state.roomInfo.payouts = action.payload;
    //   }
    // },

    updatePlayers: (state, action: PayloadAction<Player[]>) => {
      state.roomInfo!.players = action.payload;
    },

    resetBids: (state) => {
      state.roomInfo!.bids = [];
    },

    updateChatRoom: (state, action: PayloadAction<Message>) => {
      state.roomInfo!.chat?.messages?.push(action.payload)
    },

    leaveRoom: (state) => {
      state.roomInfo = null;
      state.colyseusRoomId = null;
      state.roomLink = null;
    },

    logOut: (state) => {
      state.roomInfo = null;
      state.colyseusRoomId = null;
      state.roomLink = null;
    }
  }
});

export const { 
    setGameState, addBid, setCurrentTurn, updatePlayers, 
    resetBids, updateRoomInfo,leaveRoom, logOut, updateChatRoom,
    // setPayouts
  } = gameSlice.actions;
  
export const gameReducer =  gameSlice.reducer;
