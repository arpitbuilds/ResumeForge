import React, { useState } from "react";
import { CopyIcon, XIcon } from "lucide-react";
import { toast } from "react-hot-toast";

const ShareModal = ({ isOpen, onClose, resumeId }) => {
  const [company, setCompany] = useState("");

  if (!isOpen) return null;

  const handleCopyLink = () => {
    let refQuery = "";
    if (company && company.trim() !== "") {
      refQuery = "?ref=" + encodeURIComponent(company.trim());
    }

    const frontendUrl = window.location.href.split("/app/")[0];
    const resumeUrl = frontendUrl + "/view/" + resumeId + refQuery;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(resumeUrl)
        .then(() => {
          toast.success(company ? `Tracking link for ${company} copied!` : "Public link copied to clipboard!");
          onClose();
        })
        .catch(() => toast.error("Failed to copy to clipboard."));
    } else {
      toast.error("Clipboard API not supported on this browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <XIcon className="size-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-2">Share Resume</h3>
        <p className="text-sm text-slate-400 mb-6">
          Generate a unique tracking link for a specific company or role so you can see exactly who views your resume!
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Company / Role Name (Optional)
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, Amazon Software Engineer..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCopyLink}
            className="px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-colors flex items-center gap-2"
          >
            <CopyIcon className="size-4" /> Copy Tracking Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
