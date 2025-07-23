/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Room, Client } from 'colyseus.js';
import { COLYSEUS_WS_URL } from '../constants';
import { GameState } from '../hooks/GameState';
import { leaveRoom, setGameState, updateChatRoom } from '../redux/slices/gameSlice';
import { AppDispatch } from '../redux/reduxStore';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { successToastOptions } from '../types';

interface TurnTimerType {
    username: string;
    duration: number;
    deadline: number;
}


interface RoomContextType {
    isConnecting: boolean;
    isConnected: boolean;
    room: Room<GameState> | null;
    join: (roomId: string, userId: string, playerUsername: string) => Promise<void>;
    startGame: () => Promise<void>;
    playCard: (cardName: string) => Promise<void>;
    consentedLeave: (currentUser: string) => Promise<void>;
    sendMessagesInChat: (sender: string, message: string, time: string) => Promise<void>;
    joinError: boolean;
    state: GameState | null;
    turnTimer: TurnTimerType | null;
}


export const RoomContext = createContext<RoomContextType>({
    isConnecting: false,
    isConnected: false,
    room: null,
    join: async () => {},
    startGame: async () => {},
    playCard: async () => {},
    consentedLeave: async () => {},
    sendMessagesInChat: async () => {},
    turnTimer: null,
    joinError: false,
    state: null,

});

export const useRoom = () => useContext(RoomContext);
// Initialize client
const client = new Client(COLYSEUS_WS_URL);
let hasActiveJoinRequest = false;

export function RoomProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const [joinError, setJoinError] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [state, setState] = useState<GameState | null>(null);
    const [room, setRoom] = useState<Room<GameState> | null>(null);
    const [turnTimer, setTurnTimer] = useState<TurnTimerType | null>(null);

    useEffect(() => {
        if (!room || !isConnected) return;

        const handleStateChange = (state: GameState) => setState(state);
        const handleLeave = () => setIsConnected(false);
        const handleUpdate = (payload: any) => dispatch(setGameState(payload));
        const handleNotification = (payload: any) => toast.success(payload.message, successToastOptions);

        room.onStateChange(handleStateChange);
        room.onLeave(handleLeave);
        room.onMessage("update_state", handleUpdate);
        room.onMessage("notification", handleNotification);
        room.onMessage("start_turn_timer", ({ username, duration, deadline }) => {
            setTurnTimer({ username, duration, deadline });
        });
        room.onMessage("receive_chat_message", ({sender, content, time}) => {
            dispatch(updateChatRoom({sender, content, time}));
        });

        return () => {
            room.removeAllListeners();
        };
        }, [room, isConnected, dispatch]);

        const join = async (roomId: string, userId: string, playerUsername: string) => {
            if (hasActiveJoinRequest) return;
            hasActiveJoinRequest = true;
            setIsConnecting(true);

        try {
        const joinedRoom = await client.joinById<GameState>(roomId, {userId, playerUsername });

        setRoom(joinedRoom);
        setIsConnected(true);

        // For reconnection
        localStorage.setItem(
            'reconnection',
            JSON.stringify({
            token: joinedRoom.reconnectionToken,
            roomId: joinedRoom.roomId,
            })
        );
        } catch (e) {
        console.error('Join room failed:', e);
        setJoinError(true);
        } finally {
        setIsConnecting(false);
        hasActiveJoinRequest = false;
        }
    };

    const startGame = async () => {
        if (!room || !isConnected) return;

        try {
        room.send('start_game'); // This sends a message to trigger startGame in server (you must handle this)
        } catch (error) {
        console.error('Error starting game:', error);
        setJoinError(true);
        }
    };

    const playCard = async (cardName: string) => {
        if (!room || !isConnected || hasActiveJoinRequest) return;

        try {
            room.send('play_card', { cardName });
        } catch (err) {
            console.error('Error playing card:', err);
        }
    };

    const consentedLeave = async () => {
        try {
            localStorage.removeItem("reconnection");
            if (confirm('Are you sure you want to leave the game?')) {
                await room?.leave();
                dispatch(leaveRoom());
            }
        } catch (err) {
            console.error('Error leaving room', err);
        }
    };

    const sendMessagesInChat = async (sender:string, content:string, time:string) => {
        if (!room || !isConnected || hasActiveJoinRequest) return;
        try {
            room.send('send_chat_message', { sender, content, time });
        } catch (err) {
            console.error('Error leaving room', err)
        }
    }

    return (
        <RoomContext.Provider
        value={{
            isConnecting,
            isConnected,
            room,
            join,
            startGame,
            playCard,
            consentedLeave,
            sendMessagesInChat,
            joinError,
            state,
            turnTimer
        }}
        >
        {children}
        </RoomContext.Provider>
    );
}
