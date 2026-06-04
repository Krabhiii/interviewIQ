import React, { useState, useEffect, useRef } from "react";
import { Bell, LogOut, Coins, Menu, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { setUserData } from "../redux/userSlice";
import AuthModel from "./AuthModel";

export default function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [showCredits, setShowCredits] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navigate = useNavigate();
  const ref = useRef();

  const requireAuth = (callback) => {
    if (!userData) {
      setShowAuthModal(true);
      return;
    }
    callback();
  };

  const handleLogout = async () => {
    try {
      await axios.get(serverUrl + "/api/auth/logout", {
        withCredentials: true,
      });

      dispatch(setUserData(null));
      setShowCredits(false);
      setShowUserMenu(false);

      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowCredits(false);
        setShowUserMenu(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowCredits(false);
        setShowUserMenu(false);
        setShowAuthModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const dropdownAnim = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 18,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <div className="px-3 md:px-6 sticky top-0 z-50">
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="
            w-full rounded-2xl md:rounded-full
            bg-[#111827]
            border border-white/10
            shadow-lg
          "
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

            {/* LOGO */}
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white font-bold text-xl cursor-pointer"
            >
              <Bot className="text-blue-400" />
              InterviewIQ<span className="text-blue-400">.AI</span>
            </div>

            {/* RIGHT */}
            <div ref={ref} className="flex items-center gap-4 text-white relative">

              <Bell
                className="cursor-pointer text-gray-300 hover:text-white transition"
                onClick={() => requireAuth(() => console.log("notifications"))}
              />

              {/* CREDITS */}
              <div className="relative">
                <div
                  onClick={() =>
                    requireAuth(() => {
                      setShowCredits(!showCredits);
                      setShowUserMenu(false);
                    })
                  }
                  className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full cursor-pointer hover:bg-white/10 transition"
                >
                  <Coins className="text-yellow-400" size={18} />
                  <span className="text-sm">{userData?.credits ?? 0}</span>
                </div>

                <AnimatePresence>
                  {showCredits && (
                    <motion.div
                      variants={dropdownAnim}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-3 w-56 bg-[#1f2937] border border-white/10 rounded-xl shadow-xl p-4 text-white"
                    >
                      <p className="text-sm mb-3 font-semibold">
                        Need more credits?
                      </p>

                      <button
                        onClick={() => navigate("/pricing")}
                        className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-lg font-semibold transition"
                      >
                        Continue →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PROFILE */}
              <div className="relative">
                <div
                  onClick={() =>
                    requireAuth(() => {
                      setShowUserMenu(!showUserMenu);
                      setShowCredits(false);
                    })
                  }
                  className="cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    {userData?.name?.[0] || <User size={16} />}
                  </div>
                </div>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      variants={dropdownAnim}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-3 w-64 bg-[#1f2937] border border-white/10 rounded-xl shadow-xl p-4 text-white"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-lg">
                          {userData?.name?.[0] || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {userData?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-400">Active User</p>
                        </div>
                      </div>

                      <div className="h-[1px] bg-white/10 my-3"></div>

                      <button
                        onClick={() => requireAuth(() => navigate("/history"))}
                        className="w-full mb-2 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm transition"
                      >
                        Interview History
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Menu className="md:hidden cursor-pointer text-gray-300" />
            </div>
          </div>
        </motion.nav>
      </div>

      {showAuthModal && (
        <AuthModel onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}