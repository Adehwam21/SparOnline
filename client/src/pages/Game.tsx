import React, { useEffect, useState } from "react";
import Room from "../components/Room/Room";
import WaitingScreen  from "../components/Room/WaitingScreen"; // Import the WaitingScreen component
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/reduxStore";
import { useRoom } from "../contexts/roomContext";
import { useParams } from "react-router-dom";


const GamePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { join, isConnected, isConnecting, } = useRoom();
  const { id: roomId } = useParams();
  const gameState = useSelector((state: RootState) => state.game);
  const currentUser = useSelector((state: RootState) => state.auth?.user?.username) || "Guest";
  const roomLink = useSelector((state: RootState) => state.game.roomLink );
  const [isHost, setIsHost] = useState(true);
  const [isWaitingScreenOpen, setIsWaitingScreenOpen] = useState(true);

  const handleCloseWaitingScreen = () => {
    setIsWaitingScreenOpen(false);
  };

  useEffect(() => {
    if (gameState) {
      setIsHost(gameState.roomInfo.creator === currentUser);
    }
  }, [gameState, currentUser]);

  useEffect(() => {
    if (!isConnected && !isConnecting && roomId) {
      join(roomId, currentUser, dispatch);
    }
  }, [roomId, isConnected, isConnecting, dispatch, join, currentUser]);
  

  if (!gameState) {
    return <div className="flex items-center justify-center h-screen text-white">Loading game...</div>;
  }

  return (
    <div className="h-[60rem] md:h-full bg-green-600 pt-20 text-white">
      <WaitingScreen
        isOpen={isWaitingScreenOpen}
        roomLink={roomLink!}
        gameStatus={gameState.roomInfo!.gameStatus as "ready" | "started"}
        isHost={isHost}
        onStartGame={() => console.log("Game started!")}
        onClose={handleCloseWaitingScreen}
      />

      <Room
        players={Object.values(gameState.roomInfo?.players || {})}
        currentTurn={gameState.roomInfo?.currentTurn ?? ""}
        currentUser={currentUser}
        maxPoints={gameState.roomInfo?.maxPoints ?? "0"}
        bids={gameState.roomInfo?.bids ?? []}
      />
    </div>
  );
};

export default GamePage;
