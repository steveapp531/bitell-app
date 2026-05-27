import Payable from "../models/Payable.js";

export async function getPayables(req, res, next) {
  try {
    const payables = await Payable.find({ user: req.user._id }).sort({ dueDate: 1, createdAt: -1 });

    const now = new Date();
    const enriched = payables.map((p) => {
      const obj = p.toObject();
      // Auto-flag overdue based on dueDate
      if (p.status === "upcoming" && p.dueDate && p.dueDate < now) {
        obj.status = "overdue";
      }
      return obj;
    });

    const upcoming = enriched.filter((p) => p.status !== "paid");
    const totalUpcoming = upcoming.reduce((sum, p) => sum + p.amount, 0);
    const overdueCount = enriched.filter((p) => p.status === "overdue").length;
    const dueSoonCount = enriched.filter((p) => {
      if (p.status === "paid") return false;
      if (!p.dueDate) return false;
      const daysUntilDue = Math.ceil((new Date(p.dueDate) - now) / (1000 * 60 * 60 * 24));
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    }).length;

    res.json({
      payables: enriched,
      totalUpcoming,
      overdueCount,
      dueSoonCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function createPayable(req, res, next) {
  try {
    const { payee, description, amount, dueDate, category, isRecurring, recurringFrequency, phone } = req.body;

    if (!payee || !amount) {
      return res.status(400).json({ message: "Payee and amount are required" });
    }

    const payable = new Payable({
      user: req.user._id,
      payee,
      description: description || "",
      amount: Number(amount),
      dueDate: dueDate ? new Date(dueDate) : null,
      category: category || "Other",
      isRecurring: Boolean(isRecurring),
      recurringFrequency: recurringFrequency || null,
      phone: phone || null,
    });

    await payable.save();
    res.status(201).json({ payable });
  } catch (err) {
    next(err);
  }
}

export async function updatePayable(req, res, next) {
  try {
    const payable = await Payable.findOne({ _id: req.params.id, user: req.user._id });
    if (!payable) return res.status(404).json({ message: "Payable not found" });

    const allowed = ["payee", "description", "amount", "dueDate", "category", "status", "isRecurring", "recurringFrequency", "phone"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) payable[field] = req.body[field];
    });

    await payable.save();
    res.json({ payable });
  } catch (err) {
    next(err);
  }
}

export async function deletePayable(req, res, next) {
  try {
    const result = await Payable.deleteOne({ _id: req.params.id, user: req.user._id });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Payable not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
}
