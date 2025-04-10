import React, { useEffect, useState } from "react";
import Room from "../components/Room/Room";
import WaitingScreen  from "../components/Room/WaitingScreen"; // Import the WaitingScreen component
import { useSelector } from "react-redux";
import { RootState } from "../redux/reduxStore";


const GamePage: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth?.user?.username) || "Aaron";
  // const roomInfo = useSelector((state: RootState) => state.game?.roomInfo);
  // const gameMode = roomInfo?.gameMode;
  // const roomId = roomInfo?.roomId;


  const roomLink = useSelector((state: RootState) => state.game.roomLink );
  const gameState = useSelector((state: RootState) => state.game);
  const [isHost, setIsHost] = useState(false);
  const [isWaitingScreenOpen, setIsWaitingScreenOpen] = useState(true);

  const handleCloseWaitingScreen = () => {
    setIsWaitingScreenOpen(false);
  };

  useEffect(() => {
    if (gameState) {
      setIsHost(gameState.roomInfo.creator === currentUser);
    }
  }, [gameState, currentUser]);
  

  if (!gameState) {
    return <div className="flex items-center justify-center h-screen text-white">Loading game...</div>;
  }

  return (
    <div className="h-[60rem] md:h-full bg-green-600 pt-20 text-white">
      <WaitingScreen
        isOpen={isWaitingScreenOpen}
        roomLink={roomLink!}
        gameStatus={gameState.roomInfo.gameStatus as "waiting" | "ready" | "started"}
        isHost={isHost}
        onStartGame={() => console.log("Game started!")}
        onClose={handleCloseWaitingScreen}
      />

      <Room
        players={gameState.roomInfo.players}
        currentTurn={gameState.roomInfo!.currentTurn!} 
        maxPoints={gameState.roomInfo!.maxPoints!}
        bids={gameState.roomInfo!.bids!}
      />
    </div>
  );
};

export default GamePage;
