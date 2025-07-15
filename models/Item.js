import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Clerk user ID
    name: { type: String, required: true },
    origin: { type: String, required: true },
    status: { type: String, required: true },
    mass: { type: String, required: true },
    unit: {type: String, required: true},
    price: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    location: { type: String },

    // Store images as base64
     images: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
