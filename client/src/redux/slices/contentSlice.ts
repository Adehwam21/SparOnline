import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserProfile {
  balance: number
}

export interface ContentState {
  profile: UserProfile | null
}

const initialState: ContentState = {
  profile: null
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {

    setContent : (state, action: PayloadAction<ContentState>) => {
      state.profile = action.payload.profile
    },

    updateContentState : (state, action: PayloadAction<ContentState>) => {
      state.profile = action.payload.profile
    },

    updateUserBalance : (state, action: PayloadAction<ContentState>) => {
      state.profile!.balance = action.payload.profile!.balance
    },
  }
});

export const { 
  setContent, updateContentState, updateUserBalance,
  } = contentSlice.actions;
  
export const contentReducer =  contentSlice.reducer;
