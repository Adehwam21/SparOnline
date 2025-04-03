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
    <div className="w-full h-full md:h-fit flex flex-col p-5 lg:p-10 items-center justify-center text-white">
      {/* Game Board */}
        <GameBoard players={players} currentPlayerId={currentPlayerId} maxPoints={maxPoints} />
    </div>
  );
};

export default Room;
