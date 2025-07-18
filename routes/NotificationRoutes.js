import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// Send a notification
router.post('/send', async (req, res) => {
  const { userId, title, message, buyerflag } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      buyerflag
    });

    res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error('Error sending notification:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user notifications
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Clear all notifications for a user
router.delete('/clear/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await Notification.deleteMany({ userId });

    res.status(200).json({ success: true, message: 'Notifications cleared' });
  } catch (err) {
    console.error('Error clearing notifications:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
router.patch('/read-all/:userId', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.params.userId }, { markAsRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.patch('/read/:notificationId', async (req, res) => {
  const { notificationId } = req.params;

  try {
    const updated = await Notification.findByIdAndUpdate(
      notificationId,
      { markAsRead: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, notification: updated });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

export default router;
