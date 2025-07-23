import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector} from "react-redux";
import { RootState } from "../redux/reduxStore";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import UserHandle from "./User/UserHandle";
import SettingsMenu from "./User/SettingsMenu";
import { formatNumber } from "../utils/helpers";
import { fetchUpdatedUserBalance } from "../services/auth";

const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(()=>{
    if (user){
      fetchUpdatedUserBalance();
    }
  }, [user])

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

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className= "fixed top-0 left-0 w-full h-16 bg-green-900 text-white px-4 flex items-center justify-between shadow-md z-50 shadow-2xll"
    >
      {/* Left Section: Mobile Menu Button & Logo */}
      <div className="flex justify-center items-center text-center gap-10">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-yellow-300 text-2xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes size={30} /> : <FaBars size={30} />}
        </button>

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-yellow-300">
          SparOnline
        </Link>

        {/* Middle Section: Navigation (Hidden on mobile) */}
        <nav className="hidden md:flex gap-6 text-lg">
          <Link to="/" className="hover:text-yellow-300 transition">Play</Link>
          <Link to="/learn" className="hover:text-yellow-300 transition">Learn</Link>
          <Link to="/watch" className="hover:text-yellow-300 transition">Leaderboard</Link>
          <Link to="/watch" className="hover:text-yellow-300 transition">Store</Link>
        </nav>
      </div>

      {/* Right Section: User Profile (Hidden on mobile) */}
      <div className="flex md:flex items-center justify-center gap-2">
        {user && typeof user === "object" && Object.keys(user).length > 0 ? (
          <UserHandle user={user} coins={formatNumber(user.balance!)} />
        ) : (
          <Link
            to="/sign-in"
            className="flex justify-center text-md text-center items-center text-green-800 font-bold bg-yellow-500 p-3 rounded-md hover:bg-yellow-300 transition"
          >
            Sign In
          </Link>
        )}

        <SettingsMenu/>
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
            <Link to="/watch" className="hover:text-yellow-400 transition" onClick={() => setIsMobileMenuOpen(false)}>
              Store
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
