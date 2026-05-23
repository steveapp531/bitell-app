import Debtor from "../models/Debtor.js";

export async function getDebtors(req, res, next) {
  try {
    const debtors = await Debtor.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Auto-mark as overdue based on dueDate
    const now = new Date();
    const updated = debtors.map((d) => {
      const obj = d.toObject();
      if (d.status === "outstanding" && d.dueDate && d.dueDate < now) {
        obj.status = "overdue";
      }
      return obj;
    });

    const totalOutstanding = updated
      .filter((d) => d.status !== "paid")
      .reduce((sum, d) => sum + d.amount, 0);

    const overdueCount = updated.filter((d) => d.status === "overdue").length;

    res.json({ debtors: updated, totalOutstanding, overdueCount });
  } catch (err) {
    next(err);
  }
}

export async function createDebtor(req, res, next) {
  try {
    const { name, description, amount, dueDate, phone } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ message: "Name and amount are required" });
    }

    const debtor = new Debtor({
      user: req.user._id,
      name,
      description: description || "",
      amount: Number(amount),
      dueDate: dueDate ? new Date(dueDate) : null,
      phone: phone || null,
    });

    await debtor.save();
    res.status(201).json({ debtor });
  } catch (err) {
    next(err);
  }
}

export async function updateDebtor(req, res, next) {
  try {
    const debtor = await Debtor.findOne({ _id: req.params.id, user: req.user._id });
    if (!debtor) return res.status(404).json({ message: "Debtor not found" });

    const allowed = ["name", "description", "amount", "dueDate", "phone", "status"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) debtor[field] = req.body[field];
    });

    await debtor.save();
    res.json({ debtor });
  } catch (err) {
    next(err);
  }
}

export async function deleteDebtor(req, res, next) {
  try {
    const result = await Debtor.deleteOne({ _id: req.params.id, user: req.user._id });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Debtor not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
}
