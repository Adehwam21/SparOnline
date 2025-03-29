import { configureStore } from "@reduxjs/toolkit";
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import { thunk } from "redux-thunk";
import { gameReducer } from "./slices/gameSlice" 
import { authReducer } from "./slices/authSlice"

const authPersistConfig = {
    key: 'auth',
    storage: typeof window !== 'undefined' ? createWebStorage('local') : {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    },
    whitelist: ['authState'],
  };

const gamePersistConfig = {
    key: 'game',
    storage: typeof window !== 'undefined' ? createWebStorage('local') : {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    },
    whitelist: ['gameState'],
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer), // Persist auth state
    game: persistReducer(gamePersistConfig, gameReducer), // Persist game state
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(thunk),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
