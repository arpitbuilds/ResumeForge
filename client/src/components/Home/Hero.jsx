import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Hero = () => {
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen text-slate-200 relative overflow-hidden flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full point-events-none -z-10"></div>

      {/* Navbar (Landing Specific) */}
      <nav className="z-50 flex items-center justify-between w-full py-6 px-6 md:px-16 lg:px-24 xl:px-40">
        <a href="/" className="text-2xl font-bold tracking-tighter drop-shadow-md text-white">
          Resume<span className="text-blue-500">Forge</span>
        </a>

        <div className="flex gap-4">
          <Link
            to="/app?state=register"
            className="hidden md:block px-6 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-full text-white font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            hidden={user}
          >
            Get Started
          </Link>

          <Link
            to="/app?state=login"
            className="hidden md:block px-6 py-2 border border-slate-700 hover:bg-slate-800 active:scale-95 transition-all rounded-full text-slate-300 hover:text-white"
            hidden={user}
          >
            Login
          </Link>

          <Link
            to="/app"
            className="hidden md:block px-8 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-full text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            hidden={!user}
          >
            Dashboard
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden active:scale-90 transition text-slate-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="lucide lucide-menu"
          >
            <path d="M4 5h16M4 12h16M4 19h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[100] bg-[#0B0F19]/95 backdrop-blur-md text-white flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 transition rounded-full text-white"
        >
          X
        </button>
        {!user ? (
          <>
            <Link onClick={() => setMenuOpen(false)} to="/app?state=register" className="text-2xl font-medium">Get Started</Link>
            <Link onClick={() => setMenuOpen(false)} to="/app?state=login" className="text-2xl font-medium text-slate-400">Login</Link>
          </>
        ) : (
          <Link onClick={() => setMenuOpen(false)} to="/app" className="text-2xl font-medium text-blue-400">Dashboard</Link>
        )}
      </div>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-16 mt-10 md:mt-20">
        <h1 className="text-5xl md:text-7xl font-bold max-w-5xl tracking-tight leading-tight md:leading-tight mb-6 mt-12">
          Turbocharge your career with{" "}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            ResumeForge
          </span>
        </h1>

        <p className="max-w-xl text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
          Create, edit, and tailor your professional resumes with intelligent ATS matching assistance—all within a seamless, beautifully designed dark interface.
        </p>

        <div className="flex sm:flex-row flex-col items-center gap-4">
          <Link
            to="/app"
            className="group font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-14 flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
          >
            Start Building Free
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-right group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
