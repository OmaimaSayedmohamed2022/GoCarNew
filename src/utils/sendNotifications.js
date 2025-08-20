
import Notification from "../models/notificationModel.js";

export const pushNotification = async (userId, userType, title, message, type = "system") => {
  try {
    if (!userId) {
      console.warn("pushNotification: missing userId, skipping", { title, userType });
      return null;
    }
    if (!userType) {
      console.warn("pushNotification: missing userType, skipping", { userId, title });
      return null;
    }

    const doc = await Notification.create({
      userId,
      userType,
      title,
      message,
      type
    });

  

    console.log("pushNotification: created", { id: doc._id.toString(), userId, userType, title });
    return doc;
  } catch (err) {
    console.error("pushNotification: error creating notification", err.message || err);
    return null; // don't throw so main flow continues
  }
};
