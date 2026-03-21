import React, { useEffect, useState } from "react";
import {
  FilePenLineIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../configs/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import pdfToText from "react-pdftotext";

// --- Reusable Component: Modal Wrapper ---
// In a real application, this would be in its own file (e.g., ModalWrapper.jsx)
const ModalWrapper = ({ children, onClose, onSubmit }) => (
  <form
    onSubmit={onSubmit}
    onClick={onClose}
    className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative bg-slate-900 border border-slate-700 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl w-full max-w-md p-6 sm:p-8"
    >
      {children}
      <button type="button" onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
        <XIcon size={20} />
      </button>
    </div>
  </form>
);

// --- Main Dashboard Component ---
const Dashboard = () => {
  const { token, user } = useSelector((state) => state.auth);

  const colors = ["#818cf8", "#f472b6", "#34d399", "#38bdf8", "#fbbf24"];

  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [editResumeId, setEditResumeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);

  const navigate = useNavigate();

  // Helper function to reset form state
  const resetForm = () => {
    setTitle("");
    setResumeFile(null);
    setEditResumeId("");
  };

  // --- API Handlers ---

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get("/api/users/resumes", {
        headers: {
          Authorization: token,
        },
      });
      // Ensure we set an array to prevent .map() errors
      setAllResumes(data.resumes || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load resumes.");
    }
  };

  const createResume = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post(
        "/api/resumes/create",
        { title },
        { headers: { Authorization: token } }
      );
      setAllResumes([...allResumes, data.resume]);
      setShowCreateResume(false);
      resetForm();
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create resume.");
    }
  };

  const uploadResume = async (event) => {
    event.preventDefault();
    if (!resumeFile) return toast.error("Please select a file to upload.");

    setIsLoading(true);

    try {
      const resumeText = await pdfToText(resumeFile);
      const { data } = await api.post(
        "/api/ai/upload-resume",
        { title, resumeText },
        { headers: { Authorization: token } }
      );
      setShowUploadResume(false);
      resetForm();
      navigate(`/app/builder/${data.resumeId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload resume.");
    } finally {
      setIsLoading(false);
    }
  };

  const editTitle = async (event) => {
    event.preventDefault();
    setIsUpdatingTitle(true);

    try {
      const { data } = await api.put(
        `/api/resumes/update`,
        { resumeId: editResumeId, resumeData: { title } },
        { headers: { Authorization: token } }
      );

      // ✅ FIX: Correct logic to map over the array and update only the matching resume
      setAllResumes(
        allResumes.map((resume) =>
          resume._id === editResumeId ? { ...resume, title } : resume
        )
      );
      resetForm();
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update title.");
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  const deleteResume = async (resumeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (confirmDelete) {
      try {
        const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, {
          headers: { Authorization: token },
        });
        setAllResumes(allResumes.filter((resume) => resume._id !== resumeId));
        toast.success(data.message);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to delete resume."
        );
      }
    }
  };

  // --- Effects ---

  useEffect(() => {
    loadAllResumes();
  }, []);

  // --- Rendered JSX ---

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <p className="text-3xl font-semibold mb-8 text-white tracking-tight">
          Welcome, {user?.name || "User"}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowCreateResume(true)}
            className="w-full sm:max-w-44 h-52 flex flex-col items-center justify-center rounded-2xl gap-3 bg-slate-800/40 backdrop-blur text-slate-300 border border-dashed border-slate-600 group hover:border-indigo-400 hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 cursor-pointer"
          >
            <div className="p-3 bg-indigo-500/10 rounded-full group-hover:bg-indigo-500/20 transition-colors">
              <PlusIcon className="size-8 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 transition-all duration-300" />
            </div>
            <p className="font-medium group-hover:text-indigo-300 transition-colors">
              Create Resume
            </p>
          </button>

          <button
            onClick={() => setShowUploadResume(true)}
            className="w-full sm:max-w-44 h-52 flex flex-col items-center justify-center rounded-2xl gap-3 bg-slate-800/40 backdrop-blur text-slate-300 border border-dashed border-slate-600 group hover:border-purple-400 hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 cursor-pointer"
          >
            <div className="p-3 bg-purple-500/10 rounded-full group-hover:bg-purple-500/20 transition-colors">
              <UploadCloudIcon className="size-8 text-purple-400 group-hover:text-purple-300 group-hover:-translate-y-1 transition-all duration-300" />
            </div>
            <p className="font-medium group-hover:text-purple-300 transition-colors">
              Upload Existing
            </p>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-medium text-slate-200">My Resumes</h2>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        {/* Resumes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {/* ✅ FIX: Use Optional Chaining to prevent 'Cannot read properties of null (reading 'map')' */}
          {allResumes?.map((resume, index) => {
            const baseColor = colors[index % colors.length];

            return (
              <div
                key={index}
                onClick={() => navigate(`/app/builder/${resume._id}`)}
                className="relative w-full aspect-[3/4] flex flex-col items-center justify-center rounded-xl gap-3 border group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${baseColor}15, ${baseColor}30)`,
                  borderColor: baseColor + "40",
                }}
              >
                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors pointer-events-none"></div>

                <div 
                  className="z-10 p-4 rounded-full bg-slate-900/50 group-hover:scale-110 transition-transform duration-300 backdrop-blur"
                  style={{ boxShadow: `0 0 15px ${baseColor}30` }}
                >
                  <FilePenLineIcon
                    className="size-8"
                    style={{ color: baseColor }}
                  />
                </div>

                <p
                  className="z-10 text-sm font-medium group-hover:text-white transition-colors px-3 text-center line-clamp-2"
                  style={{ color: baseColor }}
                >
                  {resume.title}
                </p>

                <p
                  className="z-10 absolute bottom-3 text-[11px] font-medium opacity-60 group-hover:opacity-100 transition-all duration-300 px-2 text-center text-slate-300"
                >
                  {new Date(resume.updatedAt).toLocaleDateString()}
                </p>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity z-20"
                >
                  <button
                    onClick={() => {
                      setEditResumeId(resume._id);
                      setTitle(resume.title);
                    }}
                    className="p-1.5 rounded-md bg-slate-800/80 hover:bg-blue-500 hover:text-white text-slate-300 backdrop-blur transition-all"
                    title="Edit Title"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    onClick={() => deleteResume(resume._id)}
                    className="p-1.5 rounded-md bg-slate-800/80 hover:bg-red-500 hover:text-white text-slate-300 backdrop-blur transition-all"
                    title="Delete Resume"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Resume Modal */}
        {showCreateResume && (
          <ModalWrapper
            onSubmit={createResume}
            onClose={() => {
              setShowCreateResume(false);
              resetForm();
            }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-white tracking-tight">Create new resume</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Resume Title</label>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="e.g. Software Engineer - Google"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 outline-none transition-all"
                required
              />
            </div>
            <button className="w-full py-3 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium active:scale-[0.98] transition-all flex items-center justify-center">
              Create Resume
            </button>
          </ModalWrapper>
        )}

        {/* Upload Resume Modal */}
        {showUploadResume && (
          <ModalWrapper
            onSubmit={uploadResume}
            onClose={() => {
              setShowUploadResume(false);
              resetForm();
            }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-white tracking-tight">Upload existing resume</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Resume Title</label>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="e.g. Product Manager Data"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-500 outline-none transition-all"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="resume-input"
                className="block text-sm font-medium text-slate-400 mb-2"
              >
                Select PDF File
              </label>
              <label htmlFor="resume-input" className="flex flex-col items-center justify-center gap-3 border-2 text-slate-400 border-slate-700 bg-slate-800/30 border-dashed rounded-xl p-4 py-8 hover:border-purple-500 hover:bg-slate-800/50 cursor-pointer transition-all">
                {resumeFile ? (
                  <div className="flex flex-col items-center">
                    <FilePenLineIcon className="size-10 mb-2 text-purple-400" />
                    <p className="text-purple-300 font-medium text-center">{resumeFile.name}</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-slate-800 rounded-full">
                      <UploadCloudIcon className="size-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-center">Click to upload</p>
                      <p className="text-xs text-slate-500 mt-1">PDF format only (Max 5MB)</p>
                    </div>
                  </>
                )}
              </label>

              <input
                type="file"
                name="resume-input"
                id="resume-input"
                accept=".pdf"
                hidden
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
            </div>

            <button
              disabled={isLoading || !resumeFile}
              className="w-full py-3 h-12 bg-purple-600 text-white rounded-lg hover:bg-purple-500 font-medium active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <LoaderCircleIcon className="animate-spin size-5 mr-2" />
                  Uploading...
                </>
              ) : (
                "Start Analyzing"
              )}
            </button>
          </ModalWrapper>
        )}

        {/* Edit Title Modal */}
        {editResumeId && (
          <ModalWrapper
            onSubmit={editTitle}
            onClose={() => {
              setEditResumeId("");
              setTitle("");
            }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-white tracking-tight">Edit title</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Resume Title</label>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter new title"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 outline-none transition-all"
                required
              />
            </div>
            <button
              disabled={isUpdatingTitle}
              className="w-full py-3 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              {isUpdatingTitle ? (
                <>
                  <LoaderCircleIcon className="animate-spin size-5 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </ModalWrapper>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
