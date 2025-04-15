import React, { useState, useEffect } from "react";
import Opponent from "./Opponent";
import PlayerBar from "./PlayerBar";
import DropZone from "./DropZone";

interface GameBoardProps {
  players: {id:string, username: string; score: number; hand: string[], active: boolean,  }[];
  bids: { username: string; cards: string[] }[];
  currentTurn: string;
  currentUser: string;
  maxPoints: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ players = [], bids = [], currentTurn, currentUser, maxPoints }) => {
  const player = players.find((p) => p.username === currentUser);
  const opponents = players.filter((p) => p.username !== currentUser) || [];
  const isTurn = player?.username === currentTurn;
  
  const [playableCards, setPlayableCards] = useState<string[]>(player?.hand || []);

  // This function is called when a card is dropped in DropZone
  const handleCardDropped = (card: string) => {
    setPlayableCards((prevCards) => prevCards.filter((c) => c !== card)); // Update state correctly
  };

  // Debugging: Log the updated state after it changes
  useEffect(() => {
    console.log("Updated playableCards:", playableCards);
  }, [playableCards]); // Runs whenever playableCards changes

  return (
    <div className="relative w-full min-h-[50rem] md:min-h-[30rem] rounded-lg flex flex-col p-10 items-center justify-evenly bg-green-700 text-white">
      {/* Opponents */}
      <div className="flex mb-2 flex-col lg:flex-row items-center justify-center gap-4">
      {opponents.length > 0 &&
        opponents.map((opponent, index) => {
          const opponentBid = bids.find((bid) => bid.username === opponent.username); // get this opponent's bid

          return (
            <div key={index} className={`w-full md:w-auto ${opponents.length === 1 ? "text-center" : ""}`}>
              <Opponent
                {...opponent}
                maxPoints={maxPoints}
                bids={opponentBid?.cards || []}
              />
            </div>
          );
        })}
      </div>

      {/* Player Section */}
      <div>
        {player && (
          <div className="relative p-2 flex flex-col justify-center space-y-2 items-center w-full">
            <DropZone isTurn={isTurn} onCardDropped={handleCardDropped} />
            <PlayerBar
              username={player.username}
              score={player.score}
              playableCards={playableCards}
              isTurn={isTurn}
              maxPoints={maxPoints}
              onCardDropped={handleCardDropped}
              />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
