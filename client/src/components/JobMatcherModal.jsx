import React, { useState } from "react";
import api from "../configs/api";
import { X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const JobMatcherModal = ({ isOpen, onClose, resumeData }) => {
  const { token } = useSelector((state) => state.auth);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleClose = () => {
    setResult(null);
    setError("");
    setJobDescription("");
    onClose();
  };

  const analyzeMatch = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(
        "/api/ai/match-job",
        { resumeData, jobDescription },
        { headers: { Authorization: token } }
      );
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to match job. Please try again."
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
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-slate-50 shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">Job Description Matcher</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 rounded-full transition"
          >
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="size-10 animate-spin text-blue-500 mb-4" />
              <p className="text-lg">Comparing your resume to the job description...</p>
              <p className="text-sm mt-2 opacity-70">This typically takes 5-10 seconds.</p>
            </div>
          ) : error && !result ? (
            <div className="flex flex-col h-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Paste Job Description Here:</label>
              <textarea 
                className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none mb-4"
                placeholder="Paste the full job description from LinkedIn, Indeed, etc..."
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  setError("");
                }}
              />
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
                {error}
              </div>
              <button 
                onClick={analyzeMatch}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Analyze Match
              </button>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Score Display */}
              <div className="flex flex-col items-center">
                <div className="relative size-32">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-slate-100" strokeWidth="3"></circle>
                    <circle 
                      cx="18" cy="18" r="16" fill="none" 
                      className={`stroke-current ${result.matchPercentage >= 75 ? 'text-green-500' : result.matchPercentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`} 
                      strokeWidth="3" 
                      strokeDasharray="100" 
                      strokeDashoffset={Math.max(0, 100 - result.matchPercentage)} 
                      strokeLinecap="round"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">{result.matchPercentage}%</span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Match</span>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Met Skills */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <h4 className="flex items-center gap-2 text-green-800 font-semibold mb-3">
                    <CheckCircle className="size-4" /> Matching Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matchingSkills?.map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {(!result.matchingSkills || result.matchingSkills.length === 0) && (
                      <span className="text-green-600 text-xs italic">No direct keyword matches found.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <h4 className="flex items-center gap-2 text-red-800 font-semibold mb-3">
                    <AlertTriangle className="size-4" /> Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords?.map((keyword, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium border border-red-200">
                        + {keyword}
                      </span>
                    ))}
                    {(!result.missingKeywords || result.missingKeywords.length === 0) && (
                      <span className="text-red-600 text-xs italic">You matched all major keywords!</span>
                    )}
                  </div>
                  <p className="text-[10px] text-red-500 mt-3 italic leading-tight">Try working these keywords organically into your summary or experience bullet points.</p>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                 <button onClick={() => setResult(null)} className="text-sm text-blue-600 hover:text-blue-800 underline">Try another job description</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Paste Job Description Here:</label>
              <textarea 
                className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none mb-4"
                placeholder="Paste the full job description from LinkedIn, Indeed, etc..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <button 
                onClick={analyzeMatch}
                disabled={!jobDescription.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
              >
                Analyze Match
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatcherModal;
