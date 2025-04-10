import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Player interface with hand of cards
interface Player {
  username: string;
  score: number;
  rating: number;
  hand: string[]; // Each player's hand (cards)
}

interface GameState {
  // loading: boolean; // Loading state for the game
  roomInfo: { 
    roomId: string | null; // Unique identifier for the room
    gameMode: string | null; // Type of game (e.g., "race", "custom")
    hand: string[]; // Current player's hand
    bids: { player: string; cards: string[] }[]; // Bids made by players
    currentTurn: string | null;
    leadingCard: { playerUsername: string; card: string }| null; // Leading card in the current round
    players: Player[]; // List of players
    round: string; // Current round
    gameStatus: string | null;
    creator: string | null; // Creator of the game
    maxPoints: string | null; // Maximum points to win the game
  },
  colyseusRoomId: string | null; // ID of the Colyseus room
  roomLink: string | null;

}

const initialState: GameState = {
  // loading: false,
  roomInfo: {
    roomId: null,
    gameMode: null,
    hand: [],
    bids: [],
    leadingCard: null,
    currentTurn: null,
    players: [],
    round: "0",
    gameStatus: null,
    creator: null,
    maxPoints: null, // Maximum points to win the game
  },
  colyseusRoomId: null,
  roomLink: null,
  
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // roomCreationStart: (state) => {
    //   state.loading = true
    // },
    // roomCreationEnd: (state) => {
    //   state.loading = false
    // },
    setGameState : (state, action: PayloadAction<GameState>) => {
      state.roomInfo = action.payload.roomInfo;
      state.colyseusRoomId = action.payload.colyseusRoomId;
      state.roomLink = action.payload.roomLink;

    },
    setHand: (state, action: PayloadAction<string[]>) => {
      state.roomInfo.hand = action.payload;
    },
    addBid: (state, action: PayloadAction<{ player: string; cards: string[] }>) => {
      state.roomInfo.bids.push(action.payload);
    },
    setCurrentTurn: (state, action: PayloadAction<string>) => {
      state.roomInfo.currentTurn = action.payload;
    },
    updatePlayers: (state, action: PayloadAction<Player[]>) => {
      state.roomInfo.players = action.payload;
    },
    updateRound: (state, action: PayloadAction<string>) => {
      state.roomInfo.round = action.payload;
    },
    resetBids: (state) => {
      state.roomInfo.bids = [];
    },
  }
});

export const { setGameState, setHand, addBid, setCurrentTurn, updatePlayers, updateRound, resetBids } = gameSlice.actions;
export const gameReducer =  gameSlice.reducer;
