import express from 'express';
import Cart from '../models/Cart.js';
import Item from '../models/Item.js';
import Order from '../models/Order.js';
const router = express.Router();

// Add item to cart
router.post('/', async (req, res) => {
  const { userId, itemId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [{ itemId, quantity }] });
    } else {
      const existingItem = cart.items.find(i => i.itemId.toString() === itemId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ itemId, quantity });
      }
    }
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Get cart for a user
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.itemId');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    console.error('Fetch cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Update quantity of an item
router.put('/:userId/:itemId', async (req, res) => {
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.itemId.toString() === req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/:userId/:itemId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.itemId.toString() !== req.params.itemId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Checkout (clears cart)
// POST /api/cart/checkout/:buyerId
router.post('/checkout/:buyerId', async (req, res) => {
  const buyerId = req.params.buyerId;
  const {
    selectedItems,       // Array of itemIds
    buyerName,
    buyerEmail,
    buyerAddress,
    buyerPhone,
    paymentMethod,
    deliveryFee = 0,
  } = req.body;

  if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
    return res.status(400).json({ message: 'No items selected for checkout' });
  }

  try {
    // 1. Load full cart with item data
    const cart = await Cart.findOne({ userId: buyerId }).populate('items.itemId');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const selectedCartItems = cart.items.filter(cartItem =>
      selectedItems.includes(cartItem.itemId._id.toString())
    );

    if (selectedCartItems.length === 0) {
      return res.status(400).json({ message: 'Selected items not found in cart' });
    }

    // 2. Group by vendor
    const byVendor = {};
    for (const cartItem of selectedCartItems) {
      const item = cartItem.itemId;
      const vendor = item.userId.toString();

      if (!byVendor[vendor]) byVendor[vendor] = [];

      byVendor[vendor].push({
        itemId: item._id,
        itemName: item.name,
        quantity: cartItem.quantity,
        pricePerUnit: item.price,
        total: item.price * cartItem.quantity,
      });
    }

    // 3. Create Orders per vendor
    const createdOrders = [];

    for (const [vendorId, items] of Object.entries(byVendor)) {
      const subtotal = items.reduce((sum, i) => sum + i.total, 0);
      const total = subtotal + deliveryFee;

      const order = await Order.create({
        buyer: {
          id: buyerId,
          name: buyerName,
          email: buyerEmail,
          address: buyerAddress,
          phone: buyerPhone,
        },
        vendorId,
        items,
        bill: {
          subtotal,
          delivery: deliveryFee,
          total,
        },
        paymentMethod,
      });

      createdOrders.push(order);
    }

    // 4. Remove only selected items from cart
    cart.items = cart.items.filter(
      item => !selectedItems.includes(item.itemId._id.toString())
    );
    await cart.save();

    res.status(201).json({
      message: 'Checkout successful',
      orders: createdOrders,
    });

  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});



export default router;
