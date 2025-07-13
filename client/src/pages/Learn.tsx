import React from "react";
import Header from "../components/Header";

const LearnPage: React.FC = () => {
  return (
    <div className=" min-h-screen flex flex-col p-6 bg-transparent text-white">
      <Header />
      
      <div className="max-w-3xl pt-15">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">How to Play</h1>
        
        <p className="text-lg mb-4">
          SparOnline is a strategic card game which follows the logic of the traditional Ghanaian card game (SPAR). It requires a deck of cards, and a set of players. The goal is to outbid your opponents in each round and accumulate the most points.
        </p>

        <h2 className="text-2xl font-bold text-yellow-200 mt-6 mb-2">Game Setup</h2>
        <p className="mb-2">A deck of cards of ranks <span className="text-yellow-400 font-bold">6 – King</span></p>
        <p className="mb-2">A maximum of <span className="text-yellow-400 font-bold">2 – 4 players</span> can play at a time.</p>
        <p className="mb-4">Each player starts with <span className="text-yellow-400 font-bold">five random cards not entirely same suits </span>.</p>

        <h2 className="text-2xl font-bold text-yellow-200 mt-6 mb-2">Gameplay</h2>
        <p className="mb-4">
          1. The Leader plays the first card, beginning the round. <br />
          2. Other players must play a higher-ranked card of the same suit if possible. <br />
          3. If a player cannot play a higher card, they may play any card but will lose 3 points if they had a card of the same suit. <br />
          4. The player who played the highest-ranked valid card becomes the next Leader. <br />
          5. This continues until all five cards have been played. The player who won the last round gets awarded points.
        </p>

        <h2 className="text-2xl font-bold text-yellow-200 mt-6 mb-2">Scoring System</h2>
        <p className="mb-2">
          The winner of each round earns points based on the highest-ranked card played in the lasat move of the round:
        </p>
        <ul className="mb-4">
          <li className="text-yellow-400 font-bold">6 → 3 points</li>
          <li className="text-yellow-400 font-bold">7 → 2 points</li>
          <li className="text-yellow-400 font-bold">8, 9, 10, J, Q, K → 1 point</li>
        </ul>

        <h2 className="text-2xl font-bold text-yellow-200 mt-6 mb-2">Winning the Game</h2>
        <p className="mb-4">
          The game continues until a player reaches the maximum score set at the start. Depending on the mode, the first player to reach this wins, or the last man standing wins (i.e. when other all players have been eliminated).
        </p>

        <h2 className="text-2xl font-bold text-yellow-200 mt-6 mb-2">Special Bonus</h2>
        <p>
          If a player wins using a special sequence of 6s and 7s and were never out-bidded, they earn extra points:
        </p>
        <ul className="mb-4">
          <li className="text-yellow-400 font-bold">Three 6s → 9 points</li>
          <li className="text-yellow-400 font-bold">Two 6s & one 7 → 8 points</li>
          <li className="text-yellow-400 font-bold">Three 7s → 6 points</li>
        </ul>
        <p>
          For this to hold, a card in the sequence must not have the same suit as the next card in the sequence
          Note that the last card always takes precedence in points calculation.
        </p>
        <p className="mt-3">
          Example1: Assuming the player was never out-bidded in the last three bids,
        </p>
        <p>
          7S, 6H, 6C  → 2 + 3+ 3 = 8 points,
        </p>
        <p>
          7S, 6H, 7H  → 0 + 0 + 2 = 3 points,
        </p>
        <p>
          7S, 6S, 7C  → 0 + 3 + 5 = 5 points,
        </p>
        <p className="mt-3">
        Example2: Assuming the player was never out-bidded in the last two bids,
        </p>
        <p>
          6H, 6C  →  3+ 3 = 6 points,
        </p>
        <p>
          6H, 7H  →  0 + 2 = 2 points,
        </p>

        <h2 className="text-2xl font-bold text-yellow-200 mt-6 mb-2">Ready to Play?</h2>
        <p className="mb-6">Gather your friends and try out SparOnline now!</p>

        <button className="bg-yellow-500 text-gray-900 px-6 py-2 font-bold hover:bg-yellow-400 transition-all duration-200">
          Share
        </button>
      </div>
    </div>
  );
};

export default LearnPage;
