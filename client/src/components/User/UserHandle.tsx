import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch} from "react-redux";
import { persistor,resetApp} from "../../redux/reduxStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";

interface UserHandleProps {
  user: { username: string; avatarUrl?: string }; // adjust type accordingly
  coins: string;
}

const UserHandle: React.FC<UserHandleProps> = ({user, coins}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = () => {
      dispatch(resetApp());
      persistor.purge()

      localStorage.removeItem("token");
      localStorage.removeItem("reconnection");
      navigate("/")

      toast.success("Logged out successfully");
      setIsOpen(false);
    };

  return (
    <div className="relative" ref={menuRef}>      
      <div className="flex justify-between items-center text-center gap-5 p-2">
        {/* Wallet */}
        <div className="flex items-center bg-black/60 backdrop-blur-md rounded-2xl pr-2 shadow-md text-yellow-400 max-w-full overflow-hidden">
          <img className="h-8 w-8 shrink-0" src="/images/game-elements/coin.png" alt="Coin" />
          <div className="flex-1 px-2 py-1 font-bold text-sm truncate text-right">
            {coins}
          </div>
        </div>

        {/* User Button */}
        <button
          className="flex items-center gap-2 p-2 rounded-lg hover:text-green-800 hover:bg-yellow-300 transition text-yellow-300"
          onClick={() => setIsOpen(!isOpen)}
          >
          <FaUserCircle size={30} />
          <span className="font-bold text-md md:inline-block">{user.username}</span>
          
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 top-14 mt-3 w-48 bg-white text-green-900 rounded-lg shadow-lg"
          >
            <ul className="p-1">
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-sm hover:bg-gray-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser /> Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/preferences"
                  className="flex items-center gap-2 px-4 py-2 rounded-sm hover:bg-gray-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCog /> Preferences
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-sm w-full text-left hover:bg-red-200 text-red-600 transition"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserHandle;
