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
    <div className="flex justify-center text-center items-center">
      <div className="flex justify-center text-center items-center rounded-t-sm gap-3 p-2 bg-black/30 backdrop-blur-md text-yellow-400">
        <img className="h-6 w-6" src="/images/game-elements/stopwatch.png" alt="Game variant icon" />
        <span className="text-md font-bold">{secondsLeft +1}</span>
      </div>
    </div>
  );
};
