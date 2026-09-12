import { getDashboardData } from "../services/dashboard.service.js";

export async function getDashboard(req, res) {
  try {
    const dashboard = await getDashboardData(req.user.userId);

    res.json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard data",
    });
  }
}