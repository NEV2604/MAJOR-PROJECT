import { askFinancialAssistant } from "../services/ai.service.js";

export async function ask(req, res) {
  try {
    const { question } = req.body;

    console.log("AI request received:", question);

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const result = await askFinancialAssistant(
      req.user.userId,
      question.trim()
    );

    console.log("AI response generated successfully");

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("AI Assistant error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      errorType: error.constructor?.name,
    });
  }
}