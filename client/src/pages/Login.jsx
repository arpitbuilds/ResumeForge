import { Lock, Mail, User2Icon, LoaderCircleIcon } from "lucide-react";
import React from "react";
import api from "../configs/api";
import { useDispatch } from "react-redux";
import { login } from "../app/features/authSlice";
import toast from "react-hot-toast";

const Login = () => {
  const dispatch = useDispatch();

  // Retrieves query parameters from the URL (e.g., ?state=register).
  const query = new URLSearchParams(window.location.search);
  const urlState = query.get("state");

  const [state, setState] = React.useState(urlState || "login");
  const [isLoading, setIsLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post(`/api/users/${state}`, formData);
      dispatch(login(data));
      localStorage.setItem("token", data.token);
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] relative z-0">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0B0F19] to-[#0B0F19] -z-10"></div>

      <form
        onSubmit={handleSubmit}
        className="sm:w-[400px] w-[90%] text-center border border-slate-800 rounded-2xl px-8 py-10 bg-slate-900/50 backdrop-blur-xl shadow-2xl"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-4">
          <Lock className="text-blue-500" size={24} />
        </div>

        <h1 className="text-white text-3xl font-semibold tracking-tight">
          {state === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-slate-400 text-sm mt-2 mb-8">
          {state === "login" ? "Enter your details to access your account" : "Sign up to start building your resume"}
        </p>

        {state !== "login" && (
          <div className="flex items-center mb-4 w-full bg-slate-800/50 border border-slate-700 h-12 rounded-lg overflow-hidden pl-4 pr-2 gap-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <User2Icon size={18} className="text-slate-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full bg-transparent border-none outline-none ring-0 text-white placeholder-slate-500"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="flex items-center mb-4 w-full bg-slate-800/50 border border-slate-700 h-12 rounded-lg overflow-hidden pl-4 pr-2 gap-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <Mail size={18} className="text-slate-400" />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="w-full bg-transparent border-none outline-none ring-0 text-white placeholder-slate-500"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center mb-2 w-full bg-slate-800/50 border border-slate-700 h-12 rounded-lg overflow-hidden pl-4 pr-2 gap-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <Lock size={18} className="text-slate-400" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full bg-transparent border-none outline-none ring-0 text-white placeholder-slate-500"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="text-left mb-6 mt-2">
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors" type="button">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-70 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <LoaderCircleIcon className="animate-spin size-5 mr-2" />
              Please wait...
            </>
          ) : state === "login" ? (
            "Sign In"
          ) : (
            "Sign Up"
          )}
        </button>

        <p className="text-slate-400 text-sm mt-8">
          {state === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setState((prev) => (prev === "login" ? "register" : "login"))}
            className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors ml-1"
          >
            {state === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
