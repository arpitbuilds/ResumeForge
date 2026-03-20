import React, { useEffect, useState } from "react";
import api from "../configs/api";
import { X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const ATSAnalyzerModal = ({ isOpen, onClose, resumeData }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      analyzeResume();
    } else {
      // Reset state when closed
      setResult(null);
      setError("");
    }
  }, [isOpen]);

  const analyzeResume = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(
        "/api/ai/analyze-ats",
        { resumeData },
        { headers: { Authorization: token } }
      );
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to analyze resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-slate-50">
          <h2 className="text-xl font-semibold text-slate-800">ATS Analyzer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition"
          >
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="size-10 animate-spin text-blue-500 mb-4" />
              <p className="text-lg">Analyzing your resume against ATS criteria...</p>
              <p className="text-sm mt-2 opacity-70">This typically takes 5-10 seconds.</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
              {error}
              <br />
              <button 
                onClick={analyzeResume}
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 font-medium transition"
              >
                Try Again
              </button>
            </div>
          ) : result ? (
            <div className="space-y-8">
              {/* Score Display */}
              <div className="flex flex-col items-center">
                <div className="relative size-32">
                  {/* Outer circle */}
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-slate-100" strokeWidth="3"></circle>
                    <circle 
                      cx="18" cy="18" r="16" fill="none" 
                      className={`stroke-current ${result.score >= 80 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`} 
                      strokeWidth="3" 
                      strokeDasharray="100" 
                      strokeDashoffset={Math.max(0, 100 - result.score)} 
                      strokeLinecap="round"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">{result.score}</span>
                    <span className="text-xs font-medium text-slate-400">/ 100</span>
                  </div>
                </div>
                <h3 className="text-lg font-medium mt-4 text-slate-700">Overall Match Score</h3>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                  <h4 className="flex items-center gap-2 text-green-800 font-semibold mb-4">
                    <CheckCircle className="size-5" /> Strengths
                  </h4>
                  <ul className="space-y-3">
                    {result.strengths?.map((str, i) => (
                      <li key={i} className="flex items-start gap-2 text-green-700 text-sm">
                        <span className="mt-1.5 size-1.5 rounded-full bg-green-500 shrink-0"></span>
                        {str}
                      </li>
                    ))}
                    {result.strengths?.length === 0 && (
                      <li className="text-green-600 text-sm italic">No notable strengths found.</li>
                    )}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                  <h4 className="flex items-center gap-2 text-red-800 font-semibold mb-4">
                    <AlertTriangle className="size-5" /> Areas to Improve
                  </h4>
                  <ul className="space-y-3">
                    {result.weaknesses?.map((weak, i) => (
                      <li key={i} className="flex items-start gap-2 text-red-700 text-sm">
                        <span className="mt-1.5 size-1.5 rounded-full bg-red-400 shrink-0"></span>
                        {weak}
                      </li>
                    ))}
                    {result.weaknesses?.length === 0 && (
                      <li className="text-red-600 text-sm italic">Looking good! No major issues found.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ATSAnalyzerModal;
