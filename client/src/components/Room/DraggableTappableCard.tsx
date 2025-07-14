import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Card from "./Card";
import { useRoom } from "../../contexts/roomContext";

interface Props {
  id: string;
  isTurn: boolean;
}

const DraggableTappableCard: React.FC<Props> = ({ id, isTurn }) => {
  const { playCard } = useRoom();
  const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    touchAction: "none" as const,
    userSelect: "none" as const,
  };

  const handleTapToBid = () => {
    if (isTurn && !isDragging) {
      console.log("Tapped:", id);
      playCard(id);
    }
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`transition-transform z-50 ${
        isDragging ? "opacity-0" : "hover:scale-105 cursor-pointer"
      }`}
      onClick={handleTapToBid}
      {...listeners}
      {...attributes}
    >
      <Card card={id} />
    </button>
  );
};

export default DraggableTappableCard;
