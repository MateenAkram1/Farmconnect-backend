import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  itemId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName:     { type: String, required: true },
  quantity:     { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  total:        { type: Number, required: true },
});

const billSchema = new mongoose.Schema({
  subtotal: { type: Number, required: true },
  delivery: { type: Number, required: true },
  total:    { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  // Who placed the order
  buyer: {
    id:      { type: String, required: true },      // Clerk user ID
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    address: { type: String, required: true },
    phone:   { type: String, required: true },
  },

  // Which vendor this particular order goes to
  vendorId: { type: String, required: true },

  items:        [ orderItemSchema ],   // The line items
  bill:         billSchema,           // Subtotal, delivery, total
  paymentMethod:{ type: String,        // e.g. 'card', 'cash', 'paypal'
                  enum: ['card','cash','paypal','other'],
                  required: true },

  status:       { type: String, default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
