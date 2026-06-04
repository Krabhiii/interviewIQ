import React from "react";
import { motion } from "framer-motion";
import Auth from "../pages/Auth"; // ✅ correct path

function AuthModel({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[999]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[90%] max-w-md"
      >
        {/* ✅ REAL LOGIN UI */}
        <Auth onClose={onClose} />
      </motion.div>
    </div>
  );
}

export default AuthModel;