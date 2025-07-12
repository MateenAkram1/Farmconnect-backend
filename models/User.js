import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, 
    name: { type: String, required: true, default:"Your Name" },
    email: { type: String, required: true },
    address: { type: String ,default:"Your Address"},
    phone: { type: String ,default:"Your Phone Number"}
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
