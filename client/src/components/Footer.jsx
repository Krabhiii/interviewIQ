import React from "react";

const Footer = () => {
  return (
    <div className="px-3 md:px-6 mt-16">
      <footer className="relative bg-[#111827] text-white rounded-2xl md:rounded-3xl border border-white/10 shadow-lg overflow-hidden">

        <div className="relative max-w-3xl mx-auto px-4 py-6 text-center">

          {/* BRAND */}
          <h2 className="text-lg md:text-xl font-bold text-blue-400">
            InterviewIQ.AI
          </h2>

          {/* ABOUT */}
          <p className="mt-2 text-gray-400 text-xs md:text-sm leading-relaxed">
            AI-powered platform to simulate real interview experiences. Practice smarter,
            improve performance, and gain confidence.
          </p>

          {/* BOTTOM */}
          <div className="mt-4 border-t border-white/10 pt-3 text-gray-500 text-[11px]">
            © {new Date().getFullYear()} InterviewIQ.AI
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Footer;