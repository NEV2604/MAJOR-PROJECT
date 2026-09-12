import React, { useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Brain,
  ChevronRight,
  Lightbulb,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { apiRequest } from "../../services/api";

const SUGGESTED_QUESTIONS = [
  {
    icon: TrendingDown,
    text: "Where am I spending the most money?",
  },
  {
    icon: Target,
    text: "Am I on track to reach my financial goals?",
  },
  {
    icon: Lightbulb,
    text: "How can I improve my savings?",
  },
  {
    icon: TrendingUp,
    text: "What patterns do you see in my finances?",
  },
];

function extractAnswer(response) {
  if (typeof response === "string") {
    return response;
  }

  return (
    response?.answer ||
    response?.response ||
    response?.message ||
    response?.data?.answer ||
    response?.data?.response ||
    response?.data?.message ||
    response?.result ||
    response?.data?.result ||
    ""
  );
}

export default function AI() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askAI(questionText) {
    const trimmedQuestion = String(questionText || "").trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setError("");

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await apiRequest("/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });

      console.log("CAPIVORA AI response:", response);

      const answer = extractAnswer(response);

      if (!answer) {
        console.error(
          "CAPIVORA AI returned an unexpected response:",
          response
        );

        throw new Error(
          "AI responded, but no answer was returned."
        );
      }

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: answer,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (err) {
      console.error("CAPIVORA AI error:", err);

      setError(
        err.message ||
          "Unable to get a response from CAPIVORA AI."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    askAI(question);
  }

  function handleSuggestion(text) {
    askAI(text);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg border border-[#173d2d] bg-[#07150f] p-2">
            <Brain className="h-4 w-4 text-[#4edea3]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#4edea3]">
            AI Financial Engine
          </span>
        </div>

        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          AI Assistant
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
          Ask CAPIVORA anything about your finances and get
          contextual answers based on your recorded financial
          data.
        </p>
      </div>

      {/* Intro */}
      {messages.length === 0 && (
        <section className="card green-glow overflow-hidden">
          <div className="relative p-6 md:p-8">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#4edea3]/5 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#173d2d] bg-[#07150f]">
                <Sparkles className="h-7 w-7 text-[#4edea3]" />
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-white md:text-2xl">
                  Your financial Support Agent
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
                  CAPIVORA analyzes your actual transactions,
                  accounts, budgets, and goals to help you
                  understand your financial position.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Prompts */}
      {messages.length === 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-[#4edea3]" />

            <h2 className="text-sm font-bold text-white">
              Suggested questions
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {SUGGESTED_QUESTIONS.map(
              ({ icon: Icon, text }) => (
                <button
                  key={text}
                  type="button"
                  onClick={() =>
                    handleSuggestion(text)
                  }
                  disabled={loading}
                  className="group flex items-center gap-4 rounded-xl border border-[#181818] bg-[#0a0a0a] p-4 text-left transition-all duration-200 hover:border-[#252525] hover:bg-[#0d0d0d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#181818] bg-[#050505]">
                    <Icon className="h-4 w-4 text-[#4edea3]" />
                  </div>

                  <span className="flex-1 text-sm font-medium text-[#a3a3a3] group-hover:text-white">
                    {text}
                  </span>

                  <ChevronRight className="h-4 w-4 text-[#444] transition-transform group-hover:translate-x-1 group-hover:text-[#4edea3]" />
                </button>
              )
            )}
          </div>
        </section>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <section className="space-y-4">
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#173d2d] bg-[#07150f]">
                    <Bot className="h-4 w-4 text-[#4edea3]" />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl border px-5 py-4 ${
                    isUser
                      ? "border-[#245c45] bg-[#0d2118]"
                      : "border-[#181818] bg-[#0a0a0a]"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[#d4d4d4]">
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#173d2d] bg-[#07150f]">
                <Bot className="h-4 w-4 text-[#4edea3]" />
              </div>

              <div className="rounded-2xl border border-[#181818] bg-[#0a0a0a] px-5 py-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[#4edea3]" />

                  <span className="text-sm text-[#737373]">
                    CAPIVORA is analyzing your finances...
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[#3b2020] bg-[#100707] px-4 py-3">
          <p className="text-sm text-[#ff6b6b]">
            {error}
          </p>
        </div>
      )}

      {/* Ask Box */}
      <section className="sticky bottom-4 z-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#202020] bg-[#080808] p-2 shadow-2xl"
        >
          <div className="flex items-end gap-2">
            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              rows={1}
              disabled={loading}
              placeholder="Ask CAPIVORA anything about your finances..."
              className="min-h-[48px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-[#555] disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !question.trim()
              }
              className="green-button flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              <span className="hidden sm:inline">
                Ask AI
              </span>
            </button>
          </div>
        </form>

        <div className="mt-2 flex items-center justify-center gap-1.5 px-2 text-center text-[11px] text-[#444]">
          <ArrowUpRight className="h-3 w-3 text-[#4edea3]" />

          <span>
            AI insights are generated from your CAPIVORA
            financial data and are for informational purposes
            only.
          </span>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#181818] bg-[#050505] p-5">
          <Wallet className="mb-4 h-5 w-5 text-[#4edea3]" />

          <h3 className="text-sm font-bold text-white">
            Your financial data
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#555]">
            Answers are grounded in your recorded CAPIVORA
            financial information.
          </p>
        </div>

        <div className="rounded-xl border border-[#181818] bg-[#050505] p-5">
          <Brain className="mb-4 h-5 w-5 text-[#4edea3]" />

          <h3 className="text-sm font-bold text-white">
            Intelligent analysis
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#555]">
            Ask natural questions instead of manually
            interpreting every financial metric.
          </p>
        </div>

        <div className="rounded-xl border border-[#181818] bg-[#050505] p-5">
          <Lightbulb className="mb-4 h-5 w-5 text-[#4edea3]" />

          <h3 className="text-sm font-bold text-white">
            Actionable guidance
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#555]">
            Turn your financial patterns into practical next
            steps.
          </p>
        </div>
      </section>
    </div>
  );
}