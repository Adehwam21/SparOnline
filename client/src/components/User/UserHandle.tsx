import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/reduxStore";
import { logout } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";

const UserHandle: React.FC = () => {
  const dispatch = useDispatch();
  const { username } = useSelector((state: RootState) => state.auth!.user!);
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
    dispatch(logout());
    toast.success("Logged out successfully");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        className="flex items-center gap-2 p-2 rounded-lg hover:text-green-800 hover:bg-yellow-300 transition text-yellow-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaUserCircle size={30} />
        <span className="md:inline-block">{username || "Guest"}</span>
        
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 mt-3 w-48 bg-white text-green-900 rounded-lg shadow-lg"
          >
            <ul className="py-2">
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser /> Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/preferences"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCog /> Preferences
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-100 text-red-600 transition"
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
