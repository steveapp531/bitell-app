import mongoose from "mongoose";

const debtorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Debtor name is required"],
      trim: true,
      maxlength: [100, "Name too long"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Description too long"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["outstanding", "overdue", "paid"],
      default: "outstanding",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Debtor", debtorSchema);
