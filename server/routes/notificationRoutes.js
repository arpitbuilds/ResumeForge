import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { getUserNotifications, markAsRead } from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/get", protect, getUserNotifications);
notificationRouter.put("/mark-read", protect, markAsRead);

export default notificationRouter;
