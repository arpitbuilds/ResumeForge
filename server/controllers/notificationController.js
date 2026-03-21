import Notification from "../models/Notification.js";

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.body;

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true }
      );
    } else {
      // Mark all as read
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    }

    return res.status(200).json({ message: "Marked as read successfully." });
  } catch (error) {
    console.error("Error marking alerts as read:", error);
    return res.status(500).json({ message: "Failed to update notification." });
  }
};
