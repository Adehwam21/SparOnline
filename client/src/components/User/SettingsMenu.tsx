import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCog, FaBell, FaPalette, FaLock, FaServer } from "react-icons/fa";
import axios from "axios";
import { SERVER_BASE_URL } from "../../constants";

const SettingsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ping, setPing] = useState<number | null>(null);
  const [serverProcessingTime, setServerProcessingTime] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch ping and server processing time
  const measureLatency = async () => {
    try {
      const start = Date.now();
      const response = await axios.get(`${SERVER_BASE_URL}/health`);
      const end = Date.now();

      if (response.status === 200) {
        setPing(Math.round(end - start)); // Round-trip latency
        setServerProcessingTime(response.data.processingTime || null); // Ensure processingTime exists
      }
    } catch (error) {
      console.error("Failed to fetch ping:", error);
      setPing(null);
      setServerProcessingTime(null);
    }
  };

  // Auto-refresh ping every 3 seconds
  useEffect(() => {
    measureLatency();
    const interval = setInterval(measureLatency, 3000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Settings Button */}
      <button
        className="flex items-center gap-2 p-3 rounded-lg hover:bg-green-700 transition text-yellow-400"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaCog className="w-6 h-6" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 mt-2 w-56 bg-white text-gray-700 rounded-lg shadow-lg"
          >
            <ul className="py-2">
              <li>
                <Link to="/notifications" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition">
                  <FaBell /> Notifications
                </Link>
              </li>
              <li>
                <Link to="/theme" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition">
                  <FaPalette /> Theme
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition">
                  <FaLock /> Privacy
                </Link>
              </li>

              {/* Ping & Server Processing Time */}
              <li className="px-4 py-2 border-t border-gray-200">
                <motion.div
                  className="flex items-center gap-2 text-sm"
                  animate={{ opacity: [0.5, 1], scale: [0.95, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <FaServer />
                  <span>PING: {ping !== null ? `${ping} ms` : "N/A"}</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2 text-sm mt-1"
                  animate={{ opacity: [0.5, 1], scale: [0.95, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <FaServer />
                  <span>SERVER: {serverProcessingTime !== null ? `${serverProcessingTime} ms` : "N/A"}</span>
                </motion.div>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsMenu;
