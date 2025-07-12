import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Player {
  id: string; // Unique identifier for the player (session ID)
  username: string;
  score: number;
  rating: number;
  hand: string[]; // Each player's hand (cards)
  bids: string[];
  active: boolean; // Indicates if the player is active in the game
}

export interface GameState {
  roomInfo: { 
    roomId: string | null; // Unique identifier for the room
    maxPlayers: number | null;
    maxPoints: string | null; // Maximum points to win the game
    creator: string | null; // Creator of the game
    gameMode: string | null; // Type of game (e.g., "race", "custom")
    gameName: string | null;
    playerUsernames: string[] | null;
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
  } | null,
  colyseusRoomId: string | null; // ID of the Colyseus room
  roomLink: string | null;

}

const initialState: GameState = {
  roomInfo: {
    roomId: null,
    gameMode: null,
    gameName: null,
    maxPlayers: null,
    deck: null,
    bids: [],
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

    updatePlayers: (state, action: PayloadAction<Player[]>) => {
      state.roomInfo!.players = action.payload;
    },

    resetBids: (state) => {
      state.roomInfo!.bids = [];
    },

    logOut: (state) => {
      state.roomInfo = null;
      state.colyseusRoomId = null;
      state.roomLink = null;
    }
  }
});

export const { setGameState, addBid, setCurrentTurn, updatePlayers, resetBids, updateRoomInfo, logOut} = gameSlice.actions;
export const gameReducer =  gameSlice.reducer;
