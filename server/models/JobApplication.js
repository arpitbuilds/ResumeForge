import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Tailored", "Applied", "Interviewing", "Offered", "Rejected"],
      default: "Tailored",
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
    coverLetter: {
      type: String,
      default: "",
    },
    jobUrl: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const JobApplication = mongoose.model("JobApplication", JobApplicationSchema);

export default JobApplication;
