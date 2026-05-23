import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    date: { type: String },
    description: { type: String },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
  },
  { _id: false }
);

const monthlyTrendSchema = new mongoose.Schema(
  {
    month: String,      // e.g. "Mar 2024"
    rawMonth: String,   // e.g. "2024-03" — needed for month selector
    income: Number,
    expenses: Number,
    profit: Number,
  },
  { _id: false }
);

const statementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    filename: { type: String, required: true },
    currency: { type: String, default: "USD" },
    transactions: [transactionSchema],
    summary: {
      currency: String,
      totalIncome: Number,
      totalExpenses: Number,
      netProfit: Number,
      profitMargin: Number,
      transactionCount: Number,
      financialHealthScore: Number,
      cashFlowTrend: String,
      monthlyTrends: [monthlyTrendSchema],
      categoryBreakdown: [mongoose.Schema.Types.Mixed],
    },
    recommendation: {
      status: { type: String, enum: ["healthy", "warning", "critical"] },
      message: String,
      tips: [String],
    },
    periodStart: { type: String },
    periodEnd: { type: String },
  },
  {
    timestamps: true,
  }
);

statementSchema.statics.getGlobalCount = async function () {
  return this.countDocuments();
};

export default mongoose.model("Statement", statementSchema);
