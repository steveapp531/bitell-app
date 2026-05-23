import User from "../models/User.js";

export async function completeOnboarding(req, res, next) {
  try {
    const { businessName, businessType, location, monthlyRevenue } = req.body;

    if (!businessName || !businessType || !location || !monthlyRevenue) {
      return res.status(400).json({ message: "All onboarding fields are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.businessName = businessName;
    user.businessType = businessType;
    user.location = location;
    user.monthlyRevenue = monthlyRevenue;
    user.onboardingCompleted = true;

    await user.save();

    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}
