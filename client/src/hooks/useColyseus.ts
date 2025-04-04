/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Client, Room } from "colyseus.js";
import { GameState } from "../types/game";
import { setHand, updatePlayers, updateRound } from "../redux/slices/gameSlice";
import { AppDispatch } from "../redux/reduxStore";
import { COLYSEUS_WS_URL } from "../constants";

const useColyseus = (gameMode: string) => {
    const dispatch = useDispatch<AppDispatch>();
    let room: Room<GameState> // Initialize room variable

    useEffect(() => {
    const client = new Client(COLYSEUS_WS_URL);

    client.joinOrCreate<GameState>(gameMode).then((joinedRoom) => {
        room = joinedRoom;

        // Update players when they join
        room.onMessage("add_player", (players) => {
            dispatch(updatePlayers(players));
        });

        // Update round
        room.onMessage("update_round", (roundInfo) => {
            dispatch(updateRound(roundInfo.round));
        });

        // Update hand for individual player
        room.onMessage("update_player_hand", (message) => {
            dispatch(setHand(message.hand));
        });

        (window as any).colyseusRoom = room;
    });

    return () => {
            room.leave();
        };
    }, [dispatch]);

    return null;
};

export default useColyseus;
