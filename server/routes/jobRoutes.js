import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  searchJobs,
  tailorResume,
  getApplications,
  updateApplication,
  deleteApplication,
} from "../controllers/jobController.js";

const jobRouter = express.Router();

jobRouter.get("/search", protect, searchJobs);
jobRouter.post("/tailor", protect, tailorResume);
jobRouter.get("/applications", protect, getApplications);
jobRouter.put("/applications/:id", protect, updateApplication);
jobRouter.delete("/applications/:id", protect, deleteApplication);

export default jobRouter;
