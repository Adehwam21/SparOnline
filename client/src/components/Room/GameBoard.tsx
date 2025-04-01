import React from "react";
import Opponent from "./Opponent";
// import CardPile from "./CardPile";
import PlayerBar from "./PlayerBar";
import DropZone from "./DropZone";

interface GameBoardProps {
  players: { id: string; username: string; score: number; bids: string[] }[];
  currentPlayerId: string
  maxPoints: string
}

const GameBoard: React.FC<GameBoardProps> = ({ players, currentPlayerId, maxPoints}) => {
    const player = players.find((p) => p.id === currentPlayerId);
    const opponents = players.filter((p) => p.id !== currentPlayerId);
    const isTurn = (player!.id === currentPlayerId)

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center bg-green-600 text-white">
        {/* Top Opponent (For 2 & 4 Players) */}
        {opponents.length === 1 ? (
            <div className="absolute top-2 w-full flex justify-center">
            <Opponent {...opponents[0]} />
            </div>
        ) : null}

        {/* Left & Right Opponents (For 3 Players) */}
        {opponents.length === 2 ? (
            <>
            <div className="absolute left-5 top-64 transform -translate-y-1/2">
                <Opponent {...opponents[0]} />
            </div>
            <div className="absolute right-5 top-64 transform -translate-y-1/2">
                <Opponent {...opponents[1]} />
            </div>
            </>
        ) : null}

        {/** Top left right Opponents (For 4 players) */}
        {opponents.length === 3 ? (
            <>
                <div className="absolute left-2 top-64 transform -translate-y-1/2">
                    <Opponent {...opponents[0]} />
                </div>
                <div className="absolute top-2 w-full flex justify-center">
                    <Opponent {...opponents[1]} />
                </div>
                <div className="absolute right-2 top-64 transform -translate-y-1/2">
                    <Opponent {...opponents[2]} />
                </div>
            </>
        ) : null}

        {/* Bottom Played Cards Bar (Current Player) */}
        {player && (
            <div className="absolute p-2 bottom-2 flex flex-col justify-center items-center w-full">
                {/* <CardPile bids={player.bids} /> */}
                <DropZone isTurn={isTurn}/>
                <PlayerBar username={player.username} isTurn={isTurn} score={player.score} playableCards={player.bids} maxPoints={maxPoints} />
            </div>
        )}
        </div>
    );
};

export default GameBoard;
