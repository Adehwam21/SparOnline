import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy } from 'react-icons/fi';
import { FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { successToastOptions } from '../../types';

interface WaitingScreenProps {
    isOpen: boolean;
    roomId: string;
    gameStatus: "ready" | "started" | "complete";
    onStartGame?: () => void;
    onClose: () => void; // Add an onClose prop to close the screen
    }

    const WaitingScreen: React.FC<WaitingScreenProps> = ({ isOpen, roomId, gameStatus, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(roomId).then(() => {
        setCopied(true);
        });
    };

    useEffect(() => {
        if (copied) {
        toast.success("Room link copied to clipboard!", successToastOptions);
        setTimeout(() => setCopied(false), 2000); // Reset after a short delay
        }
    }, [copied]);

    if (!isOpen) return null;

    const getStatusMessage = () => {
        switch (gameStatus) {
        case "started":
            return "Room is full. Ready to start the game!";
        case "complete":
            roomId = "CLOSED";
            return "Room is closed";
        default:
            return "Waiting for more players to join the room...";
        }
    };

    return (
        <div className="fixed inset-0 flex font-bold items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="bg-white p-6 rounded-lg mx-4 shadow-xl w-full max-w-md relative space-y-4"
            >
                <button
                onClick={onClose} // Close the waiting screen when clicked
                className="absolute top-2 right-2 p-2 rounded-lg bg-red-400 hover:bg-red-500"
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
                    className="p-2 rounded-md bg-green-600 hover:bg-green-700 transition text-white"
                    title="Copy room link"
                >
                    <FiCopy size={16} />
                </button>
                </div>

                <p className="text-sm text-center text-gray-600">{getStatusMessage()}</p>
            </motion.div>
        </div>
    );
};

export default WaitingScreen;
