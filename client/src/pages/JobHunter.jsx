import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  SearchIcon,
  BriefcaseIcon,
  LoaderCircleIcon,
  XIcon,
  ExternalLinkIcon,
  FileTextIcon,
  Trash2Icon,
  ClipboardCheckIcon,
  CheckCircleIcon,
  LayersIcon,
  PenToolIcon,
} from "lucide-react";
import api from "../configs/api";
import toast from "react-hot-toast";

const JobHunter = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Tabs: 'search' or 'crm'
  const [activeTab, setActiveTab] = useState("search");

  // Job Search states
  const [searchQuery, setSearchQuery] = useState("developer");
  const [jobs, setJobs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // CRM Tracker states
  const [applications, setApplications] = useState([]);
  const [isFetchCrm, setIsFetchCrm] = useState(false);

  // Tailoring Modal states
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedBaseResume, setSelectedBaseResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [customJobUrl, setCustomJobUrl] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorStep, setTailorStep] = useState("");

  // Cover Letter Modal states
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [activeLetterText, setActiveLetterText] = useState("");

  // Fetch standard data on mount
  useEffect(() => {
    fetchResumes();
    fetchCrmData();
    searchRemoteJobs("developer");
  }, []);

  // API: Fetch User Resumes for base select
  const fetchResumes = async () => {
    try {
      const { data } = await api.get("/api/users/resumes", {
        headers: { Authorization: token },
      });
      setResumes(data.resumes || []);
      if (data.resumes && data.resumes.length > 0) {
        setSelectedBaseResume(data.resumes[0]._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // API: Fetch CRM applications
  const fetchCrmData = async () => {
    setIsFetchCrm(true);
    try {
      const { data } = await api.get("/api/jobs/applications", {
        headers: { Authorization: token },
      });
      setApplications(data.applications || []);
    } catch (error) {
      toast.error("Failed to load CRM data.");
    } finally {
      setIsFetchCrm(false);
    }
  };

  // API: Search jobs
  const searchRemoteJobs = async (queryVal) => {
    setIsSearching(true);
    try {
      const { data } = await api.get(`/api/jobs/search?q=${queryVal}`, {
        headers: { Authorization: token },
      });
      setJobs(data.jobs || []);
    } catch (error) {
      toast.error("Failed to search remote jobs.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchRemoteJobs(searchQuery);
  };

  // Prepare Tailor Modal
  const openTailorModal = (job) => {
    setSelectedJob(job);
    setCustomJobTitle(job.title || "");
    setCustomCompany(job.company_name || "");
    setCustomJobUrl(job.url || "");
    
    // Clean up description HTML for pre-filling
    const cleanDesc = job.description 
      ? job.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() 
      : "";
    setJobDescription(cleanDesc);
    setShowTailorModal(true);
  };

  // API: Start Tailoring Agent
  const triggerAutoTailor = async (e) => {
    e.preventDefault();
    if (!selectedBaseResume) {
      return toast.error("Please select a base resume to tailor.");
    }
    if (!jobDescription.trim()) {
      return toast.error("Please input the target job description.");
    }

    setIsTailoring(true);
    setTailorStep("Analyzing job requirements and matching keywords...");

    // Engagement timeouts for visual updates
    const t1 = setTimeout(() => setTailorStep("Cloning base resume structure..."), 3000);
    const t2 = setTimeout(() => setTailorStep("Gemini is tailoring professional summary & skills..."), 6000);
    const t3 = setTimeout(() => setTailorStep("Refactoring experience bullet points with action metrics..."), 9000);
    const t4 = setTimeout(() => setTailorStep("Drafting custom, high-impact cover letter..."), 13000);

    try {
      const { data } = await api.post(
        "/api/jobs/tailor",
        {
          baseResumeId: selectedBaseResume,
          jobTitle: customJobTitle,
          company: customCompany,
          jobDescription: jobDescription,
          jobUrl: customJobUrl,
        },
        { headers: { Authorization: token } }
      );

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      toast.success("Profile tailored & CRM entry created!");
      setShowTailorModal(false);
      
      // Refresh CRM data and switch tabs
      await fetchCrmData();
      setActiveTab("crm");
    } catch (error) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      toast.error(error?.response?.data?.message || "Tailoring failed.");
    } finally {
      setIsTailoring(false);
      setTailorStep("");
    }
  };

  // API: Update status
  const updateStatus = async (id, newStatus) => {
    try {
      const { data } = await api.put(
        `/api/jobs/applications/${id}`,
        { status: newStatus },
        { headers: { Authorization: token } }
      );
      setApplications(prev => prev.map(app => app._id === id ? data.application : app));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  // API: Update notes
  const handleNotesBlur = async (id, currentNotes) => {
    try {
      await api.put(
        `/api/jobs/applications/${id}`,
        { notes: currentNotes },
        { headers: { Authorization: token } }
      );
    } catch (error) {
      toast.error("Failed to save notes.");
    }
  };

  // API: Delete app
  const deleteCrmEntry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application record from your CRM?")) {
      return;
    }
    try {
      await api.delete(`/api/jobs/applications/${id}`, {
        headers: { Authorization: token },
      });
      setApplications(prev => prev.filter(app => app._id !== id));
      toast.success("Application deleted.");
    } catch (error) {
      toast.error("Failed to delete application.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Tailored": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Applied": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "Interviewing": return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse";
      case "Offered": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold";
      case "Rejected": return "bg-red-500/10 text-red-400 border border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight flex items-center gap-3">
            <BriefcaseIcon className="text-blue-500 size-8" />
            Job Hunter & Auto-Tailor CRM
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Search active remote jobs, use Gemini to automatically tailor your resume, and track applications.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit self-start">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "search"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <SearchIcon size={16} />
            Find Remote Jobs
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "crm"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayersIcon size={16} />
            CRM Tracker ({applications.length})
          </button>
        </div>
      </div>

      {/* Tab: SEARCH JOBS */}
      {activeTab === "search" && (
        <div>
          <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-8 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. React, Node, Full Stack Developer..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isSearching ? <LoaderCircleIcon className="animate-spin size-5" /> : "Search"}
            </button>
          </form>

          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <LoaderCircleIcon className="animate-spin size-12 text-blue-500 mb-4" />
              <p className="text-sm">Fetching active jobs from Remotive API...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="border border-dashed border-slate-850 rounded-2xl py-16 text-center text-slate-500">
              <BriefcaseIcon className="size-12 mx-auto mb-3 opacity-20 text-blue-500" />
              <p>No jobs found. Try typing a different technical skill.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 backdrop-blur-sm"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-white hover:text-blue-400 transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-blue-500 text-sm font-medium mt-0.5">{job.company_name}</p>
                      </div>
                      {job.candidate_required_location && (
                        <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700/60 font-medium">
                          📍 {job.candidate_required_location}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-slate-800/40 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                        {job.category || "Development"}
                      </span>
                      {job.job_type && (
                        <span className="text-xs bg-slate-800/40 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                          ⏱️ {job.job_type}
                        </span>
                      )}
                      {job.salary && (
                        <span className="text-xs bg-slate-800/40 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                          💰 {job.salary}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 line-clamp-3 mb-6 bg-slate-950/20 p-3 rounded-lg border border-slate-850">
                      {job.description ? job.description.replace(/<[^>]*>/g, " ") : "No description provided."}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-850">
                    <button
                      onClick={() => openTailorModal(job)}
                      className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <PenToolIcon size={14} />
                      AI Auto-Tailor Resume
                    </button>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white rounded-xl transition-colors border border-slate-700/60"
                      title="View on Remotive"
                    >
                      <ExternalLinkIcon size={15} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: CRM TRACKER TABLE */}
      {activeTab === "crm" && (
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          {isFetchCrm ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <LoaderCircleIcon className="animate-spin size-12 text-blue-500 mb-4" />
              <p className="text-sm">Loading tracker applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <ClipboardCheckIcon className="size-16 mx-auto mb-4 opacity-10 text-blue-500" />
              <p className="text-base font-medium">No job applications logged yet.</p>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Find a remote job postings using the search tab and click "AI Auto-Tailor" to initialize a tracked application.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-medium">
                    <th className="p-4 px-6">Company & Role</th>
                    <th className="p-4">Application Status</th>
                    <th className="p-4">Tailored Resume</th>
                    <th className="p-4">Cover Letter</th>
                    <th className="p-4">My Application Notes</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-800/10 transition-colors">
                      {/* Company & Role */}
                      <td className="p-4 px-6">
                        <div>
                          <p className="font-semibold text-white">{app.jobTitle}</p>
                          <p className="text-blue-500 text-xs mt-0.5">{app.company}</p>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 mt-1.5"
                            >
                              Open Job Link <ExternalLinkIcon size={10} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium outline-none bg-slate-950 border cursor-pointer ${getStatusStyle(app.status)}`}
                        >
                          <option value="Tailored">Tailored</option>
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Offered">Offered</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Tailored Resume */}
                      <td className="p-4">
                        {app.resumeId ? (
                          <button
                            onClick={() => navigate(`/app/builder/${app.resumeId._id || app.resumeId}`)}
                            className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium flex items-center gap-1"
                          >
                            <FileTextIcon size={13} />
                            Edit Profile
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">No linked resume</span>
                        )}
                      </td>

                      {/* Cover Letter */}
                      <td className="p-4">
                        {app.coverLetter ? (
                          <button
                            onClick={() => {
                              setActiveLetterText(app.coverLetter);
                              setShowLetterModal(true);
                            }}
                            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <FileTextIcon size={13} />
                            View Letter
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>

                      {/* Notes (Inline editable on blur) */}
                      <td className="p-4 min-w-[200px]">
                        <textarea
                          defaultValue={app.notes}
                          placeholder="Add comments, interview dates, etc..."
                          onBlur={(e) => handleNotesBlur(app._id, e.target.value)}
                          rows={1}
                          className="w-full bg-transparent hover:bg-slate-800/20 focus:bg-slate-950 border border-transparent focus:border-slate-700 px-2 py-1 rounded text-xs text-slate-300 placeholder-slate-600 focus:outline-none transition-all resize-none"
                        />
                      </td>

                      {/* Delete */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => deleteCrmEntry(app._id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Application"
                        >
                          <Trash2Icon size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL 1: AI AUTO-TAILOR AGENT CONFIG --- */}
      {showTailorModal && selectedJob && (
        <div className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden relative">
            <button
              onClick={() => !isTailoring && setShowTailorModal(false)}
              disabled={isTailoring}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-850 text-slate-400 hover:text-white transition-all disabled:opacity-30"
            >
              <XIcon size={20} />
            </button>

            <form onSubmit={triggerAutoTailor} className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-white tracking-tight mb-5 flex items-center gap-2">
                <PenToolIcon className="text-blue-500 size-6 animate-pulse" />
                Configure AI Profile Auto-Tailoring
              </h2>

              {isTailoring ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <LoaderCircleIcon className="animate-spin size-14 text-blue-500 mb-4" />
                  <p className="text-white font-medium text-sm">Deploying AI Tailoring Agent...</p>
                  <p className="text-xs text-slate-400 text-center max-w-xs mt-2 animate-pulse">
                    {tailorStep}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select Base Resume */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Select Base Profile Resume
                    </label>
                    <select
                      value={selectedBaseResume}
                      onChange={(e) => setSelectedBaseResume(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white outline-none transition-all"
                      required
                    >
                      <option value="" disabled>Select base resume...</option>
                      {resumes.map(r => (
                        <option key={r._id} value={r._id}>{r.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Target Company & Role (confirm edit) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Target Company
                      </label>
                      <input
                        type="text"
                        value={customCompany}
                        onChange={(e) => setCustomCompany(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Target Role Title
                      </label>
                      <input
                        type="text"
                        value={customJobTitle}
                        onChange={(e) => setCustomJobTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Job Description Textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Target Job Description (JD)
                    </label>
                    <textarea
                      rows={6}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste key responsibilities, requirements, and tech stack here..."
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-xs placeholder-slate-600 outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Submit Tailoring */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <CheckCircleIcon size={16} />
                    Run AI Auto-Tailor (Gemini)
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: COVER LETTER VIEWER --- */}
      {showLetterModal && (
        <div className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden relative">
            <button
              onClick={() => setShowLetterModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-850 text-slate-400 hover:text-white transition-all"
            >
              <XIcon size={20} />
            </button>

            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-white tracking-tight mb-5 flex items-center gap-2">
                <FileTextIcon className="text-blue-500 size-6" />
                Tailored AI Cover Letter
              </h2>

              <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-6 text-sm text-slate-350 max-h-[380px] overflow-y-auto font-sans leading-relaxed whitespace-pre-line custom-scrollbar select-text selection:bg-blue-500/20">
                {activeLetterText}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-850">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeLetterText);
                    toast.success("Cover letter copied to clipboard!");
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-555 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <ClipboardCheckIcon size={14} />
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowLetterModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobHunter;
