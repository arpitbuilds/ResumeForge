import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 border-t border-slate-800 bg-[#0B0F19]">
      <div className="max-w-7xl auto px-4 md:px-16 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm mx-auto">
        <p>&copy; {currentYear} ResumeForge. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <span className="hover:text-blue-400 cursor-pointer transition">Privacy Policy</span>
          <span className="hover:text-blue-400 cursor-pointer transition">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
