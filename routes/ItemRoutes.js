import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

router.post("/add-item", async (req, res) => {
  try {
    const {
      userId,
      name,
      origin,
      status,
      mass,
      unit,
      price,
      description,
      category,
      location,
      currency,
      images,
    } = req.body;

    const newItem = new Item({
      userId,
      name,
      origin,
      status,
      mass,
      unit,
      price,
      description,
      category,
      location,
      currency,
      images,
    });

    await newItem.save();
    res.status(201).json({ message: "Item added successfully", id: newItem._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const items = await Item.find({ userId });
    res.json({ success: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/items/get-item/:itemId - Fetch item by ID
router.get('/get-item/:itemId', async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET /api/items/latest - Fetch latest 20 items
router.get('/latest', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 }).limit(20);
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching latest items:', error);
    res.status(500).json({ error: 'Failed to fetch latest items' });
  }
});

router.post("/search-item/:userId", async (req, res) => {
  const { userId } = req.params;
  const { query } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const searchFilter = query
      ? {
          userId,
          name: { $regex: query, $options: "i" },
        }
      : { userId };

    const results = await Item.find(searchFilter);

    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error("Error in search-item:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get('/search/:userId', async (req, res) => {
  const { userId } = req.params;
  const { search } = req.query;

  try {
    const filter = { userId };
    if (search) {
      filter.name = { $regex: search, $options: 'i' }; 
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/items/:id - Update item partially
router.put('/edit-item/:id', async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true } // return the updated document
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/delete-item/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
