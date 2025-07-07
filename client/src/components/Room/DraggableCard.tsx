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
    };

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`transition-transform hover:scale-105 z-50 hover:cursor-pointer overflow-hidden ${
        isDragging ? "opacity-50 cursor-hand" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <Card card={id} />
    </button>
  );
};

export default DraggableCard;
