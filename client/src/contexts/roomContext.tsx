/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Room, Client } from 'colyseus.js';
import { COLYSEUS_WS_URL } from '../constants';
import { GameState } from '../hooks/GameState';
import { setGameState } from '../redux/slices/gameSlice';
import { AppDispatch } from '../redux/reduxStore';
import { useDispatch } from 'react-redux';

interface RoomContextType {
    isConnecting: boolean;
    isConnected: boolean;
    room: Room | null;
    join: (roomId: string, playerUsername: string, dispatch: AppDispatch) => Promise<void>;
    startGame: (dispatch: AppDispatch) => Promise<void>;
    playCard: (cardName: string, dispatch: AppDispatch) => Promise<void>;
    joinError: boolean;
    state: GameState | null;
}

export const RoomContext = createContext<RoomContextType>({
    isConnecting: false,
    isConnected: false,
    room: null,
    join: async () => Promise.resolve(),
    startGame: async () => Promise.resolve(),
    playCard: async () => Promise.resolve(),
    joinError: false,
    state: null ,
});

export const useRoom = () => {
    return useContext(RoomContext);
}

// New instance of the Colyseus client
let hasActiveJoinRequest = false;
const client = new Client(COLYSEUS_WS_URL);


export function RoomProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>()
    const [joinError, setJoinError] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [state, setState] = useState<GameState | any>(null);
    const [room, setRoom] = useState<Room>(null as any);

    useEffect(() => {
        if (room && isConnected) {
            room.onMessage("update_state", (payload) => {
                dispatch(setGameState(payload));
            });
            }
        
            return () => {
            room?.removeAllListeners(); // clean up when unmounting or reconnecting
            };
        }, [room, isConnected, dispatch]);


    const join = async (roomId: string, playerUsername: string, dispatch: AppDispatch) => {
        // Avoid duplicate join attempts
        if (hasActiveJoinRequest) return;
        
        hasActiveJoinRequest = true;
    
        setIsConnecting(true);
    
        try {
            const joinedRoom = await client.joinById<GameState>(roomId, { playerUsername });
        setRoom(joinedRoom);

        // Use `joinedRoom` directly here
        joinedRoom.onMessage("update_state", (payload) => {
        dispatch(setGameState(payload));
        });

        joinedRoom.onStateChange((state) => setState(state.toJSON()));
        joinedRoom.onLeave(() => setIsConnected(false));

        setIsConnected(true);

        // Store reconnection info
        localStorage.setItem("reconnection", JSON.stringify({
            token: joinedRoom.reconnectionToken,
            roomId: joinedRoom.roomId,
        }));
        } catch (e) {
            console.error("Join room failed:", e);
            setJoinError(true);
        } finally {
            setIsConnecting(false);
            hasActiveJoinRequest = false;
        }
    };

    const startGame = async (dispatch:AppDispatch) => {
        if (!room && !isConnected) return;

        if (hasActiveJoinRequest) return;
        
        hasActiveJoinRequest = true;
    
        setIsConnecting(true);

        try {

            room.onMessage("game_started", (payload) => {
                dispatch(setGameState(payload));
            })

            room.onStateChange((state) => setState(state.toJSON()));
            room.onLeave(() => setIsConnected(false));
            setIsConnected(true);
    
            // Store reconnection info
            localStorage.setItem("reconnection", JSON.stringify({
                token: room.reconnectionToken,
                roomId: room.roomId,
            }));
        } catch (error) {
            console.log("Error starting game:", error);
            setJoinError(true);
        } finally {
            setIsConnecting(false);
            hasActiveJoinRequest = false;
        }
    }

    const playCard =  async (cardName: string, dispatch: AppDispatch) => {
        if (!room && !isConnected) return;

        if (hasActiveJoinRequest) return;
        
        hasActiveJoinRequest = true;
    
        setIsConnecting(true);

        if (!room || !isConnected) return;
    
        try {
            room.send("play_card", { cardName });

            room.onMessage("update_state", (payload) => {
                dispatch(setGameState(payload));
            });

        } catch (error) {
            console.error("Error playing card:", error);
        }
    };

    return (
        <RoomContext.Provider value={{ isConnecting, isConnected, room, join, startGame, playCard, joinError, state }}>
            {children}
        </RoomContext.Provider>
    );
}
