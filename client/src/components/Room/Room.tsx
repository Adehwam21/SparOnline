import React from "react";
import GameBoard from "./GameBoard";

interface RoomProps {
//   roomName?: string;
  players: { id: string; username: string; score: number; bids: string[] }[];
  currentPlayerId: string;
  maxPoints: string
}

const Room: React.FC<RoomProps> = ({players, currentPlayerId , maxPoints}) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
      {/* Room Title */}
      {/* <div className="text-center p-4">
        <h1 className="text-2xl font-bold">{roomName}</h1>
        <p className="text-gray-300">{players.length} Players in the Room</p>
      </div> */}

      {/* Game Board */}
      <div className="flex-1 w-full flex p-10 justify-center items-center">
        <GameBoard players={players} currentPlayerId={currentPlayerId} maxPoints={maxPoints} />
      </div>
    </div>
  );
};

export default Room;
