/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState } from 'react';
import { Room, Client } from 'colyseus.js';
import { COLYSEUS_WS_URL } from '../constants';
import { GameState, setGameState, setHand, updatePlayers, updateRound } from '../redux/slices/gameSlice';
import { AppDispatch } from '../redux/reduxStore';

interface RoomContextType {
    isConnecting: boolean;
    isConnected: boolean;
    room: Room | null;
    join: (roomId: string, playerUsername: string, dispatch: AppDispatch) => Promise<void>;
    joinError: boolean;
    state: GameState | null;
}

export const RoomContext = createContext<RoomContextType>({
    isConnecting: false,
    isConnected: false,
    room: null,
    join: async () => Promise.resolve(),
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
    const [joinError, setJoinError] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [state, setState] = useState<GameState | any>(null);
    const [room, setRoom] = useState<Room>(null as any);


    const join = async (roomId: string, playerUsername: string, dispatch: AppDispatch) => {
        // Avoid duplicate join attempts
        if (hasActiveJoinRequest) return;
        
        hasActiveJoinRequest = true;
    
        setIsConnecting(true);
    
        try {
            const joinedRoom = await client.joinById<GameState>(roomId, { playerUsername });
            setRoom(joinedRoom);
    
            // Redux: listen to server messages and dispatch actions
            room.onMessage("add_player", (players) => {
                dispatch(updatePlayers(players));
            });

            room.onMessage("game_ready", (payload) => {
                dispatch(setGameState(payload));
            });
    
            room.onMessage("update_round", (roundInfo) => {
                dispatch(updateRound(roundInfo.round));
            });
    
            room.onMessage("update_player_hand", (message) => {
                dispatch(setHand(message.hand));
            });
    
            // Global room ref (optional, for debugging)
            (window as any).colyseusRoom = room;
    
            // Context state stuff
            room.onStateChange((state) => setState(state.toJSON()));
            room.onLeave(() => setIsConnected(false));
            setIsConnected(true);
    
            // Store reconnection info
            localStorage.setItem("reconnection", JSON.stringify({
                token: room.reconnectionToken,
                roomId: room.roomId,
            }));
        } catch (e) {
            console.error("Join room failed:", e);
            setJoinError(true);
        } finally {
            setIsConnecting(false);
            hasActiveJoinRequest = false;
        }
    };
    

    return (
        <RoomContext.Provider value={{ isConnecting, isConnected, room, join, joinError, state }}>
            {children}
        </RoomContext.Provider>
    );
}
