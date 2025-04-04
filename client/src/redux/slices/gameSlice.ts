import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Player interface with hand of cards
interface Player {
  username: string;
  score: number;
  rating: number;
  hand: string[]; // Each player's hand (cards)
}

interface GameState {
  hand: string[]; // Current player's hand
  bids: { playerUsername: string; card: string }[]; // Bids made by players
  currentTurn: string | null;
  players: Player[]; // List of players
  round: number; // Current round
}

const initialState: GameState = {
  hand: [],
  bids: [],
  currentTurn: null,
  players: [],
  round: 0,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setHand: (state, action: PayloadAction<string[]>) => {
      state.hand = action.payload;
    },
    addBid: (state, action: PayloadAction<{ playerUsername: string; card: string }>) => {
      state.bids.push(action.payload);
    },
    setCurrentTurn: (state, action: PayloadAction<string>) => {
      state.currentTurn = action.payload;
    },
    updatePlayers: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload;
    },
    updateRound: (state, action: PayloadAction<number>) => {
      state.round = action.payload;
    },
    resetBids: (state) => {
      state.bids = [];
    },
  }
});

export const { setHand, addBid, setCurrentTurn, updatePlayers, updateRound, resetBids } = gameSlice.actions;
export const gameReducer =  gameSlice.reducer;
