import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector} from "react-redux";
import { RootState } from "../redux/reduxStore";
import { motion, AnimatePresence } from "framer-motion";
// import { FaBars, FaTimes } from "react-icons/fa";
import UserHandle from "./User/UserHandle";
// import SettingsMenu from "./User/SettingsMenu";
// import { formatBalance } from "../utils/helpers";
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
      className= "fixed top-0 left-0 rounded-3 w-full h-16 bg-black/40 backdrop-blur-2xl text-white px-4 flex items-center justify-between shadow-md z-50 shadow-2xll"
    >
      {/* Left Section: Mobile Menu Button & Logo */}
      <div className="flex justify-center items-center text-center gap-3">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-yellow-300 text-2xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {/* {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />} */}
            <img className="h-10 w-10 rounded-md" src="/images/logo/logo1.png" alt="Spar Online log" />
        </button>

        {/* Logo */}
        <Link to="/play" className="justify-center items-center text-center text-md gap-2 hidden md:flex font-bold text-yellow-300">
          <img className="h-8 w-8 rounded-md" src="/images/logo/logo1.png" alt="Spar Online log" />
          SparOnline
        </Link>

        {/* Middle Section: Navigation (Hidden on mobile) */}
        <nav className="hidden md:flex md:ml-4 gap-6 font-semibold text-sm">
          <Link to="/play" className="hover:text-yellow-300 transition">Play</Link>
          <Link to="/learn" className="hover:text-yellow-300 transition">Learn</Link>
          {/* <Link to="/leaderboard" className="hover:text-yellow-300 transition">Leaderboard</Link> */}
          {/* <Link to="/store" className="hover:text-yellow-300 transition">Store</Link> */}
        </nav>
      </div>

      {/* Right Section: User Profile (Hidden on mobile) */}
      <div className="flex md:flex items-center justify-center gap-2">
        {user && typeof user === "object" && Object.keys(user).length > 0 ? (
          <UserHandle user={user} coins={user.balance!.toLocaleString()} />
        ) : (
          <Link
            to="/"
            className="flex justify-center text-md text-center items-center text-green-800 font-bold bg-yellow-500 p-3 rounded-md hover:bg-yellow-300 transition"
          >
            Sign In
          </Link>
        )}

        {/* <SettingsMenu/> */}
      </div>

      {/* Mobile Menu (Dropdown) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-0 w-full bg-green-800 text-white font-semibold text-sm shadow-lg py-4 px-6 flex flex-col items-center gap-4 md:hidden"
          >
            <Link to="/play" className="hover:text-yellow-400 transition" onClick={() => setIsMobileMenuOpen(false)}>
              Play
            </Link>
            <Link to="/learn" className="hover:text-yellow-400 transition" onClick={() => setIsMobileMenuOpen(false)}>
              Learn
            </Link>
            {/* <Link to="/watch" className="hover:text-yellow-400 transition" onClick={() => setIsMobileMenuOpen(false)}>
              Leaderboard
            </Link> */}
            {/* <Link to="/watch" className="hover:text-yellow-400 transition" onClick={() => setIsMobileMenuOpen(false)}>
              Store
            </Link> */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
