"use client";

import { useState } from "react";


// -----------------------------
// Allowed classification values
// -----------------------------
// values are valid in our dropdowns.

type FeedbackType =
  | "bug"
  | "feature_request"
  | "praise"
  | "question"
  | "other";

type Severity =
  | "critical"
  | "high"
  | "medium"
  | "low";


// -----------------------------
// Shape of our AI response
// -----------------------------

type Analysis = {
  theme: string;
  type: FeedbackType;
  severity: Severity;
  sentiment: string;
  summary: string;
  needs_review: boolean;
};


export default function Home() {
  // The customer feedback typed by the user.
  const [feedback, setFeedback] = useState("");

  // The ORIGINAL prediction returned by the AI.
  const [result, setResult] = useState<Analysis | null>(null);

  // The PM can change Type and Severity here.
  const [reviewedResult, setReviewedResult] =
    useState<Analysis | null>(null);

  // Loading state for the API request.
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // -----------------------------
  // Send feedback to our AI API
  // -----------------------------

  async function analyzeFeedback() {
    if (!feedback.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setReviewedResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          feedback: feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze feedback");
      }

      const data: Analysis = await response.json();

      // Save the AI's original prediction.
      setResult(data);

      // Also create an editable copy for human review.
      setReviewedResult(data);

    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong while analyzing the feedback."
      );
    } finally {
      setLoading(false);
    }
  }


  // --------------------------------
  // Update the reviewed Type value
  // --------------------------------

  function updateType(newType: FeedbackType) {
    setReviewedResult((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        type: newType,
      };
    });
  }


  // ------------------------------------
  // Update the reviewed Severity value
  // ------------------------------------

  function updateSeverity(newSeverity: Severity) {
    setReviewedResult((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        severity: newSeverity,
      };
    });
  }


  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="mx-auto max-w-3xl">

        {/* ---------------------------
            Page header
        ---------------------------- */}

        <header className="mb-10">

          <p className="mb-2 text-sm font-medium text-gray-500">
            AI Customer Feedback Analyzer
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            FeedbackLens
          </h1>

          <p className="mt-3 max-w-xl text-gray-600">
            Turn unstructured customer feedback into structured
            product insights.
          </p>

        </header>


        {/* ---------------------------
            Feedback input
        ---------------------------- */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <label
            htmlFor="feedback"
            className="block text-sm font-medium text-gray-900"
          >
            Customer feedback
          </label>

          <textarea
            id="feedback"
            value={feedback}

            onChange={(event) =>
              setFeedback(event.target.value)
            }

            placeholder="Example: I tried exporting my report three times and it keeps crashing..."

            className="mt-3 min-h-40 w-full resize-none rounded-xl border border-gray-300 p-4 text-gray-900 outline-none focus:border-gray-900"
          />

          <div className="mt-4 flex items-center justify-between">

            <p className="text-sm text-gray-500">
              {feedback.length} characters
            </p>

            <button
              onClick={analyzeFeedback}

              disabled={
                loading ||
                !feedback.trim()
              }

              className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Analyzing..."
                : "Analyze feedback"}
            </button>

          </div>

        </section>


        {/* ---------------------------
            Error message
        ---------------------------- */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* ---------------------------
            AI result + human review
        ---------------------------- */}

        {result && reviewedResult && (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  AI analysis
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                  Review classification
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Review the AI prediction and correct it if necessary.
                </p>

              </div>


              {result.needs_review && (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  Needs review
                </span>
              )}

            </div>


            {/* ---------------------------
                Classification grid
            ---------------------------- */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">


              {/* Theme remains read-only */}

              <ResultCard
                label="Theme"
                value={result.theme}
              />


              {/* TYPE is now editable */}

              <div className="rounded-xl border border-gray-200 p-4">

                <label
                  htmlFor="type"
                  className="text-sm text-gray-500"
                >
                  Type
                </label>

                <select
                  id="type"

                  value={reviewedResult.type}

                  onChange={(event) =>
                    updateType(
                      event.target.value as FeedbackType
                    )
                  }

                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-2 font-semibold text-gray-900"
                >
                  <option value="bug">
                    Bug
                  </option>

                  <option value="feature_request">
                    Feature request
                  </option>

                  <option value="praise">
                    Praise
                  </option>

                  <option value="question">
                    Question
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>


                {/* Show this message if the human changed the AI prediction */}

                {reviewedResult.type !== result.type && (
                  <p className="mt-2 text-xs text-gray-500">
                    AI suggested:{" "}
                    {formatValue(result.type)}
                  </p>
                )}

              </div>


              {/* SEVERITY is now editable */}

              <div className="rounded-xl border border-gray-200 p-4">

                <label
                  htmlFor="severity"
                  className="text-sm text-gray-500"
                >
                  Severity
                </label>

                <select
                  id="severity"

                  value={reviewedResult.severity}

                  onChange={(event) =>
                    updateSeverity(
                      event.target.value as Severity
                    )
                  }

                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-2 font-semibold text-gray-900"
                >
                  <option value="critical">
                    Critical
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="low">
                    Low
                  </option>
                </select>


                {/* Show original AI prediction if corrected */}

                {reviewedResult.severity !==
                  result.severity && (
                  <p className="mt-2 text-xs text-gray-500">
                    AI suggested:{" "}
                    {formatValue(result.severity)}
                  </p>
                )}

              </div>


              {/* Sentiment remains read-only */}

              <ResultCard
                label="Sentiment"
                value={result.sentiment}
              />

            </div>


            {/* ---------------------------
                AI-generated summary
            ---------------------------- */}

            <div className="mt-6 rounded-xl bg-gray-50 p-5">

              <p className="text-sm font-medium text-gray-500">
                Summary
              </p>

              <p className="mt-2 leading-7 text-gray-900">
                {result.summary}
              </p>

            </div>

          </section>
        )}

      </div>

    </main>
  );
}


// -----------------------------
// Read-only result card
// -----------------------------

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold capitalize text-gray-900">
        {formatValue(value)}
      </p>

    </div>
  );
}


// -----------------------------
// Format internal values nicely
// -----------------------------

// Example: feature_request. becomes: feature request

function formatValue(value: string) {
  return value.replaceAll("_", " ");
}