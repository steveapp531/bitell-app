import mongoose from "mongoose";

const PAYABLE_CATEGORIES = [
  "Rent",
  "Salary / Payroll",
  "Supplier",
  "Utilities",
  "Tax",
  "Loan Repayment",
  "Equipment",
  "Professional Services",
  "Insurance",
  "Logistics",
  "Inventory",
  "Other",
];

const payableSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    payee: {
      type: String,
      required: [true, "Payee name is required"],
      trim: true,
      maxlength: [120, "Payee name too long"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [240, "Description too long"],
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
    category: {
      type: String,
      enum: PAYABLE_CATEGORIES,
      default: "Other",
    },
    status: {
      type: String,
      enum: ["upcoming", "overdue", "paid"],
      default: "upcoming",
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "annually", null],
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

export const PAYABLE_CATEGORIES_LIST = PAYABLE_CATEGORIES;
export default mongoose.model("Payable", payableSchema);
