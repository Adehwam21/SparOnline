import React, { useState } from "react";
import { DndContext, DragStartEvent, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import Opponent from "./Opponent";
import PlayerBar from "./PlayerBar";
import BidZone from "./BidZone";
import Card from "./Card";
import { useRoom } from "../../contexts/roomContext";


interface GameBoardProps {
  players: { id: string; username: string; score: number; hand: string[]; active: boolean; connected:boolean, eliminated: boolean, bids: string[] }[];
  currentTurn: string;
  currentUser: string;
  maxPoints: string;
}

const GameBoard: React.FC<GameBoardProps> = ({
  players = [],
  currentTurn,
  currentUser,
  // maxPoints,
}) => {
  // const dispatch = useDispatch<AppDispatch>();
  const { playCard } = useRoom();

  const [activeId, setActiveId] = useState<string | null>(null);

  const player = players.find(p => p.username === currentUser);
  const opponents = players.filter(p => p.username !== currentUser && p.connected && p.active && !p.eliminated);
  const isTurn = player?.username === currentTurn;
  const bidCards = player?.bids || [];

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over?.id === "bid-zone" && isTurn) playCard(String(active.id));
    setActiveId(null);
  };

  if (!player) return null;

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} autoScroll={false}>
      <div className="relative w-full bg-transparent h-[30rem] rounded-lg flex flex-col items-center justify-between text-white">
        <div className="flex mb-2 flex-col lg:flex-row items-center justify-center gap-4">
          {opponents.map((o, i) => (
            <div key={i} className={`w-full md:w-auto ${opponents.length === 1 ? "text-center" : ""}`}>
              <Opponent {...o} />
            </div>
          ))}
        </div>

        <div className="relative flex flex-col justify-center space-y-1 items-center w-full">
          <BidZone bidCards={bidCards} score={player.score} />
          <PlayerBar
            username={player.username}
            // score={player.score}
            playableCards={player.hand}
            isTurn={isTurn}
            isActive={player.active}
            // maxPoints={maxPoints}
          />
        </div>
      </div>

      {/* only one overlay, no duplicate “shadow” */}
      <DragOverlay dropAnimation={null}>
        {activeId && <Card card={activeId} />}
      </DragOverlay>
    </DndContext>
  );
};

export default GameBoard;
