import React, { useEffect, useState } from "react";
import { useRoom } from "../../contexts/roomContext";

export const TurnCountdown: React.FC = () => {
  const { turnTimer } = useRoom();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!turnTimer) {
      setSecondsLeft(null);
      return;
    }

    const update = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.floor((turnTimer.deadline - now) / 1000));
      setSecondsLeft(timeLeft);
    };

    update(); // run immediately
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [turnTimer]);

  if (!turnTimer || secondsLeft === null) return null;

  return (
    <div className="flex justify-center item-center gap-2 text-center text-white">
      <span className="p-2 text-md font-bold">Turn: {turnTimer.username}</span>
      <span className="p-2 text-md font-bold">⏳: {secondsLeft}s</span>
    </div>
  );
};
