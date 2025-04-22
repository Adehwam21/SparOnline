import React from "react";
import GameBoard from "./GameBoard";

interface RoomProps {
//   roomName?: string;
  players: {id:string, username: string; score: number; hand:string[], active: boolean }[];
  bids: { playerUsername: string; cards: string[] }[];
  currentTurn: string;
  currentUser: string;
  maxPoints: string
}

const Room: React.FC<RoomProps> = ({players, currentTurn, currentUser, maxPoints, bids = []}) => {
  return (
    <div className="w-full h-full md:h-fit flex flex-col p-5 lg:p-10 items-center justify-center text-white">
      {/* Game Board */}
        <GameBoard 
          players={players} 
          bids={bids.map(bid => ({ username: bid.playerUsername, cards: bid.cards }))}
          currentTurn={currentTurn}
          currentUser={currentUser} 
          maxPoints={maxPoints} 
        />
    </div>
  );
};

export default Room;
