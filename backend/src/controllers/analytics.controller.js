import { getAnalytics } from "../services/analytics.service.js";

export async function getAnalyticsData(req, res) {
  try {
    const analytics = await getAnalytics(req.user.userId);

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve analytics",
    });
  }
}