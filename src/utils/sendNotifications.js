import Notification from "../models/notificationModel.js";

export const sendNotification = async (userId, title, body, type = "Trip", data = {}) => {
  await Notification.create({
    user: userId,
    title,
    body,
    type,
    data,
  });
};


export const getMyNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params; // notificationId
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
