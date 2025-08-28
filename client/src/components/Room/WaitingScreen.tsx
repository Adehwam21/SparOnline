import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCopy } from "react-icons/fi";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { successToastOptions } from "../../types";

interface Player {
    id: string;
    username: string;
    connected: boolean;
}

interface WaitingScreenProps {
    isOpen: boolean;
    roomId: string;
    gameStatus: "ready" | "started" | "complete";
    players: Player[];
    maxPlayers: number;
    currentUser?: string;
    onStartGame?: () => void;
    onClose: () => void;
}

const WaitingScreen: React.FC<WaitingScreenProps> = ({
    isOpen,
    roomId,
    gameStatus,
    players,
    maxPlayers,
    onClose,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(roomId).then(() => {
        setCopied(true);
        });
    };

    useEffect(() => {
        if (copied) {
        toast.success("Room link copied to clipboard!", successToastOptions);
        setTimeout(() => setCopied(false), 2000);
        }
    }, [copied]);

    if (!isOpen) return null;

    const playersNeeded = maxPlayers - players.length;

    const getStatusMessage = () => {
        switch (gameStatus) {
        case "started":
            return `Room is full [${players.length}/${maxPlayers}]. Starting game...`;
        case "complete":
            return "Room is closed";
        default:
            return `Waiting for ${playersNeeded} more player(s) to start. . . [${players.length}/${maxPlayers}]`;
        }
    };

    return (
        <div className="fixed inset-0 z-60  flex font-bold items-center justify-center bg-green/90 backdrop-blur-2xl ">
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-white p-6 rounded-lg mx-4 shadow-xl w-full max-w-md relative space-y-4"
        >
            <button
                onClick={gameStatus === "started" ? onClose : undefined}
                disabled={gameStatus !== "started"}
                className={`absolute top-2 right-2 p-2 rounded-lg ${
                    gameStatus === "started"
                    ? "bg-red-400 hover:bg-red-500"
                    : "bg-gray-300 cursor-not-allowed"
            }`}
            >
                <FaTimes size={16} />
            </button>

            <h2 className="text-lg font-bold text-center text-green-800">Room Code</h2>

            <div className="flex items-center gap-2">
            <input
                type="text"
                readOnly
                value={roomId}
                className="flex-1 px-3 py-2 border rounded-md text-md text-black"
            />
                <button
                    onClick={handleCopy}
                    disabled={gameStatus === "complete"}
                    className={`p-2 rounded-md ${
                        gameStatus === "complete"
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                >
                    <FiCopy size={16} />
                </button>
            </div>

            <p className="text-sm text-center text-gray-800">{getStatusMessage()}</p>
        </motion.div>
        </div>
    );
};

export default WaitingScreen;

