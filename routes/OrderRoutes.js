import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const orders = await Order
      .find({ vendorId })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching vendor orders:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor orders' });
  }
});


router.get('/buyer/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params;
    const orders = await Order
      .find({ 'buyer.id': buyerId })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching buyer orders:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch buyer orders' });
  }
});

router.patch('/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status }  = req.body;

  // Validate the new status if you have an enum
  const allowed = ['pending','shipped','delivered','cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

export default router;
