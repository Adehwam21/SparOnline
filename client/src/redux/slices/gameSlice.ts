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
    hand: string[]; // Current player's hand
    bids: { playerUsername: string; card: string }[]; // Bids made by players
    currentTurn: string | null;
    leadingCard: { playerUsername: string; card: string }| null; // Leading card in the current round
    players: Player[]; // List of players
    round: string; // Current round
    gameStatus: string | null;
  }
  roomLink: string | null;

}

const initialState: GameState = {
  // loading: false,
  roomInfo: {
    hand: [],
    bids: [],
    leadingCard: null,
    currentTurn: null,
    players: [],
    round: "0",
    gameStatus: null
  },
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
      state.roomLink = action.payload.roomLink;
      state.roomInfo.gameStatus = action.payload.roomInfo.gameStatus;

    },
    setHand: (state, action: PayloadAction<string[]>) => {
      state.roomInfo.hand = action.payload;
    },
    addBid: (state, action: PayloadAction<{ playerUsername: string; card: string }>) => {
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
