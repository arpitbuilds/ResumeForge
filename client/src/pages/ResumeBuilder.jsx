import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// Import icons for section navigation and utility buttons from Lucide.
import {
  Activity,
  ArrowLeftIcon,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileText,
  Folder,
  GraduationCap,
  Share2Icon,
  Sparkles,
  Target,
  User,
} from "lucide-react";

// Import all child form components for editing different resume sections.
import PersonalInfoForm from "../components/PersonalInfoForm";
import ResumePreview from "../components/ResumePreview";
import ATSAnalyzerModal from "../components/ATSAnalyzerModal";
import JobMatcherModal from "../components/JobMatcherModal";
import ShareModal from "../components/ShareModal";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import ProfessionalSummaryForm from "../components/ProfessionalSummaryForm";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";
import { useSelector } from "react-redux";
import api from "../configs/api";
import toast from "react-hot-toast";

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    template: "classic",
    accent_color: "#3b82f6",
    public: false,
  });

  const loadExistingResume = async () => {
    try {
      const { data } = await api.get("/api/resumes/get/" + resumeId, {
        headers: {
          Authorization: token,
        },
      });

      if (data.resume) {
        setResumeData(data.resume);
        document.title = data.resume.title;
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isJobMatcherOpen, setIsJobMatcherOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: Folder },
    { id: "skills", name: "Skills", icon: Sparkles },
  ];

  const activeSection = sections[activeSectionIndex];

  useEffect(() => {
    loadExistingResume();
  }, []);

  const changeResumeVisibility = async () => {
    try {
      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append(
        "resumeData",
        JSON.stringify({ public: !resumeData.public }),
      );

      const { data } = await api.put("/api/resumes/update", formData, {
        headers: {
          Authorization: token,
        },
      });
      setResumeData({ ...resumeData, public: !resumeData.public });
      toast.success(data.message);
    } catch (error) {
      console.error("Error in Saving resume: ", error);
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const downloadResume = () => {
    window.print();
  };

  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData);

      if (typeof resumeData.personal_info.image === "object") {
        delete updatedResumeData.personal_info.image;
      }

      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify(updatedResumeData));
      removeBackground && formData.append("removeBackground", "yes");
      typeof resumeData.personal_info.image === "object" &&
        formData.append("image", resumeData.personal_info.image);

      const { data } = await api.put("/api/resumes/update", formData, {
        headers: {
          Authorization: token,
        },
      });
      setResumeData(data.resume);
      toast.success(data.message);
    } catch (error) {
      console.error("Error in Saving resume: ", error);
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          to={"/app"}
          className="inline-flex gap-2 items-center text-slate-400 hover:text-white transition-all font-medium bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-full border border-slate-700"
        >
          <ArrowLeftIcon className="size-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel - Form Editor */}
          <div className="relative lg:col-span-5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 pt-1">
              {/* Progress Bar (Visual indicator of current section progress) */}
              <hr className="absolute top-0 left-0 right-0 border-2 border-slate-800" />
              <hr
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 border-none transition-all duration-300"
                style={{
                  width: `${
                    (activeSectionIndex * 100) / (sections.length - 1)
                  }%`
                }}
              />

              {/* Section Configuration and Navigation Controls */}
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 py-4 mt-2">
                <div className="flex items-center gap-3">
                  {/* Template Selector Component */}
                  <TemplateSelector
                    selectedTemplate={resumeData.template}
                    onChange={(template) =>
                      setResumeData((prev) => ({ ...prev, template }))
                    }
                  />

                  {/* Color Picker Component */}
                  <ColorPicker
                    selectedColor={resumeData.accent_color}
                    onChange={(color) => {
                      setResumeData((prev) => ({
                        ...prev,
                        accent_color: color,
                      }));
                    }}
                  />
                </div>

                {/* Previous/Next Step Buttons */}
                <div className="flex items-center gap-2">
                  {/* Previous Button (Hidden on first step) */}
                  {activeSectionIndex !== 0 && (
                    <button
                      onClick={() =>
                        setActiveSectionIndex((prevIndex) =>
                          Math.max(prevIndex - 1, 0),
                        )
                      }
                      className="flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
                      disabled={activeSectionIndex === 0}
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                  )}

                  {/* Next Button (Disabled on last step) */}
                  <button
                    onClick={() =>
                      setActiveSectionIndex((prevIndex) =>
                        Math.min(prevIndex + 1, sections.length - 1),
                      )
                    }
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 ${
                      activeSectionIndex === sections.length - 1 && "opacity-50 pointer-events-none"
                    }`}
                    disabled={activeSectionIndex === sections.length - 1}
                  >
                    Next <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Form Content: Conditionally renders the active form component */}
              <div className="space-y-6">
                {/* Personal Info Form */}
                {activeSection.id === "personal" && (
                  <PersonalInfoForm
                    data={resumeData.personal_info}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personal_info: data,
                      }))
                    }
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                  />
                )}

                {/* Professional Summary Form */}
                {activeSection.id === "summary" && (
                  <ProfessionalSummaryForm
                    data={resumeData.professional_summary}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        professional_summary: data,
                      }))
                    }
                    setResumeData={setResumeData}
                  />
                )}

                {/* Experience Form (Array of objects) */}
                {activeSection.id === "experience" && (
                  <ExperienceForm
                    data={resumeData.experience}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        experience: data,
                      }))
                    }
                  />
                )}

                {/* Education Form (Array of objects) */}
                {activeSection.id === "education" && (
                  <EducationForm
                    data={resumeData.education}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        education: data,
                      }))
                    }
                  />
                )}

                {/* Project Form (Array of objects) */}
                {activeSection.id === "projects" && (
                  <ProjectForm
                    data={resumeData.projects}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        projects: data,
                      }))
                    }
                  />
                )}

                {/* Skills Form (Array of objects/strings) */}
                {activeSection.id === "skills" && (
                  <SkillsForm
                    data={resumeData.skills}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        skills: data,
                      }))
                    }
                  />
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={() => {
                  toast.promise(saveResume, { loading: "Saving..." });
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all text-white font-medium rounded-lg px-6 py-3 mt-8 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Right Panel - Live Resume Preview */}
          <div className="lg:col-span-7 max-lg:mt-6 flex flex-col gap-5">
            {/* Action Buttons (Share, Visibility, Download) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
                {/* Job Matcher Button */}
                <button
                  onClick={() => setIsJobMatcherOpen(true)}
                  className="flex items-center p-2.5 px-4 gap-2 text-sm bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors font-medium backdrop-blur-sm"
                >
                  <Target className="size-4" /> Target Job
                </button>

                {/* Analyze ATS Button */}
                <button
                  onClick={() => setIsAtsModalOpen(true)}
                  className="flex items-center p-2.5 px-4 gap-2 text-sm bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors font-medium backdrop-blur-sm"
                >
                  <Activity className="size-4" /> Analyze ATS
                </button>

                {/* Share Button (Only visible if resume is public) */}
                {resumeData.public && (
                  <button
                    onClick={handleShare}
                    className="flex items-center p-2.5 px-4 gap-2 text-sm bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 border border-blue-500/20 transition-colors font-medium backdrop-blur-sm"
                  >
                    <Share2Icon className="size-4" /> Share
                  </button>
                )}

                {/* Visibility Toggle Button (Public/Private) */}
                <button
                  onClick={changeResumeVisibility}
                  className="flex items-center p-2.5 px-4 gap-2 text-sm bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg border border-purple-500/20 transition-colors font-medium backdrop-blur-sm"
                >
                  {resumeData.public ? (
                    <EyeIcon className="size-4" />
                  ) : (
                    <EyeOffIcon className="size-4" />
                  )}
                  {resumeData.public ? "Public" : "Private"}
                </button>

                {/* Download/Print Button */}
                <button
                  onClick={downloadResume}
                  className="flex items-center p-2.5 px-5 gap-2 text-sm bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-semibold shadow-md active:scale-95"
                >
                  <DownloadIcon className="size-4" /> Download PDF
                </button>
            </div>

            {/* Resume Preview Component: Renders the document based on current state */}
            {/* The wrapper bg-white text-black is necessary to reset dark mode styles for preview! */}
            <div className="bg-white text-black rounded-lg shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
              <ResumePreview
                data={resumeData}
                template={resumeData.template}
                accentColor={resumeData.accent_color}
              />
            </div>

            {/* ATS Analyzer Modal */}
            <ATSAnalyzerModal 
              isOpen={isAtsModalOpen} 
              onClose={() => setIsAtsModalOpen(false)} 
              resumeData={resumeData} 
            />

            {/* Job Matcher Modal */}
            <JobMatcherModal
              isOpen={isJobMatcherOpen}
              onClose={() => setIsJobMatcherOpen(false)}
              resumeData={resumeData}
            />

            {/* Share Modal */}
            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              resumeId={resumeId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
