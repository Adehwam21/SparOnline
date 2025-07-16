/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import { gameReducer } from "./slices/gameSlice" 
import { authReducer } from "./slices/authSlice"
import { createAction } from "@reduxjs/toolkit";

export const resetApp = createAction("app/reset");

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth", "game"],
};

const appReducer = combineReducers({
    auth: authReducer,
    game: gameReducer,

    //... add more game states
});

const rootReducer = (state: any, action: any) => {
    if (action.type == "app/reset" ){
        state = undefined;
    }

    return appReducer(state, action)
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
