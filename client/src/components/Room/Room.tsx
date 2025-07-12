import React from "react";
import GameBoard from "./GameBoard";

interface RoomProps {
  players: {
    id: string;
    username: string;
    score: number;
    hand: string[];
    bids: string[];
    active: boolean;
  }[];
  currentTurn: string;
  currentUser: string;
  maxPoints: string;
}

const Room: React.FC<RoomProps> = ({
  players,
  currentTurn,
  currentUser,
  maxPoints,
}) => {
  return (
    <div className="flex flex-col p-5 lg:p-10 items-center justify-center text-white">
      {/* Game Board */}
      <GameBoard
        players={players}
        currentTurn={currentTurn}
        currentUser={currentUser}
        maxPoints={maxPoints}
      />
    </div>
  );
};

export default Room;
