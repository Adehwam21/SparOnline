import React from "react";
import GameBoard from "./GameBoard";

interface RoomProps {
//   roomName?: string;
  players: {username: string; score: number; hand:string[] }[];
  bids: { player: string; cards: string[] }[];
  currentTurn: string;
  maxPoints: string
}

const Room: React.FC<RoomProps> = ({players, currentTurn, maxPoints, bids}) => {
  return (
    <div className="w-full h-full md:h-fit flex flex-col p-5 lg:p-10 items-center justify-center text-white">
      {/* Game Board */}
        <GameBoard 
          players={players} 
          bids={bids.map(bid => ({ username: bid.player, cards: bid.cards }))} 
          currentTurn={currentTurn} 
          maxPoints={maxPoints} 
        />
    </div>
  );
};

export default Room;
