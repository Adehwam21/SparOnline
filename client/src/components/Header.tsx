import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/reduxStore";
import { logout } from "../redux/slices/authSlice";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-full h-16 bg-green-900 text-white px-4 flex items-center justify-between shadow-md z-50"
    >
      {/* Left Section: Mobile Menu Button & Logo */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-yellow-400 text-2xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-yellow-400">
          SparOnline
        </Link>
      </div>

      {/* Middle Section: Navigation (Hidden on mobile) */}
      <nav className="hidden md:flex gap-6 text-sm">
        <Link to="/" className="hover:text-yellow-400 transition">Play</Link>
        <Link to="/learn" className="hover:text-yellow-400 transition">Learn</Link>
        <Link to="/watch" className="hover:text-yellow-400 transition">Leaderboard</Link>
      </nav>

      {/* Right Section: User Profile (Hidden on mobile) */}
      <div className="md:flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm font-medium">{user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded-md text-sm hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/sign-in" className="text-sm text-green-800 font-bold bg-yellow-300 px-3 py-1 rounded-md hover:bg-yellow-500 transition">
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Menu (Dropdown) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-0 w-full bg-green-800 text-white shadow-lg py-4 px-6 flex flex-col items-center gap-4 md:hidden"
          >
            <Link to="/" className="hover:text-yellow-400 transition" onClick={() => setIsMobileMenuOpen(false)}>
              Play
            </Link>
            <Link to="/learn" className="hover:text-yellow-400 transition" onClick={() => setIsMobileMenuOpen(false)}>
              Learn
            </Link>
            <Link to="/watch" className="hover:text-yellow-400 transition" onClick={() => setIsMobileMenuOpen(false)}>
              Leaderboard
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
