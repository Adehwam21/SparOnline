import React from "react";
import GameBoard from "./GameBoard";

interface RoomProps {
//   roomName?: string;
  players: { id: string; username: string; score: number; bids: string[], hand:string[] }[];
  currentPlayerId: string;
  maxPoints: string
}

const Room: React.FC<RoomProps> = ({players, currentPlayerId , maxPoints}) => {
  return (
    <div className="w-full h-screen flex flex-col p-10 items-center justify-center text-white">
      {/* Game Board */}
      <div className="flex-1 w-full flex justify-center items-center">
        <GameBoard players={players} currentPlayerId={currentPlayerId} maxPoints={maxPoints} />
      </div>
    </div>
  );
};

export default Room;
