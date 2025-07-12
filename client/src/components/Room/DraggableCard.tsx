import React from "react";
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import Card from "./Card";

interface Props {
  id: string;
}

const DraggableCard: React.FC<Props> = ({ id }) => {
  const { setNodeRef, listeners, attributes, transform, isDragging, } =
    useDraggable({ id });

    const style = {
      transform: CSS.Translate.toString(transform),
      touchaction: "none",
      userSction: "none"
    };

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`transition-transform hover:scale-105 z-50 overflow-hidden ${
        isDragging ? "cursor-grab opacity-0" : "hover:cursor-pointer"
      }`}
      {...listeners}
      {...attributes}
    >
      <Card card={id} />
    </button>
  );
};

export default DraggableCard;
