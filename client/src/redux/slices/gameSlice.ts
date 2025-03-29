import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GameState {
  score: number;
}

const initialState: GameState = {
  score: 0,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    increaseScore: (state, action: PayloadAction<number>) => {
      state.score += action.payload;
    },
    resetScore: (state) => {
      state.score = 0;
    },
  },
});

export const { increaseScore, resetScore } = gameSlice.actions;
export const gameReducer = gameSlice.reducer;
