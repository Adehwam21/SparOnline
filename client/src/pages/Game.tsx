import React, { useEffect, useState } from "react";
import Room from "../components/Room/Room";
import { GameState } from "../types/game";
import gameData from "../data/gameState.json"; // Import the JSON file
import WaitingScreen  from "../components/Room/WaitingScreen"; // Import the WaitingScreen component
import { useSelector } from "react-redux";
import { RootState } from "../redux/reduxStore";


const GamePage: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth?.user?.username) || "Aaron";
  const roomLink = useSelector((state: RootState) => state.game.roomLink );
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isWaitingScreenOpen, setIsWaitingScreenOpen] = useState(true);

  const handleCloseWaitingScreen = () => {
    setIsWaitingScreenOpen(false);
  };

  useEffect(() => {
    // Simulate fetching data from the server
    setTimeout(() => {
      setGameState(gameData);
      setIsHost(gameData.creator === currentUser); // Check if currentUser is the host
    }, 1000);
  }, []);

  if (!gameState) {
    return <div className="flex items-center justify-center h-screen text-white">Loading game...</div>;
  }

  return (
    <div className="h-[60rem] md:h-full bg-green-600 pt-20 text-white">
      <WaitingScreen
        isOpen={isWaitingScreenOpen}
        roomLink={roomLink!}
        gameStatus={gameState.gameStatus as "waiting" | "ready" | "started"}
        isHost={isHost}
        onStartGame={() => console.log("Game started!")}
        onClose={handleCloseWaitingScreen}
      />

      <Room
        players={gameState.players}
        currentTurn={gameState.currentTurn} 
        maxPoints={gameState.maxPoints}
        bids={gameState.bids}
      />
    </div>
  );
};

export default GamePage;
