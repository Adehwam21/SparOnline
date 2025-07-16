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
    <div className="flex justify-center item-center space-x-3 text-center text-white">
      <p className="text-md font-bold">Turn: {turnTimer.username}</p>
      <p className="text-md font-bold">⏳: {secondsLeft}s left</p>
    </div>
  );
};
