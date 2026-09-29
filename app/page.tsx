"use client";

// We use React state to store:
// - the text the user types
// - the AI result
// - loading state
// - error messages
import { useState } from "react";

// This describes the exact shape of the data we expect back from our /api/analyze endpoint.
type Analysis = {
  theme: string;
  type: string;
  severity: string;
  sentiment: string;
  summary: string;
  needs_review: boolean;
};

export default function Home() {
  // Stores the customer feedback typed into the textarea.
  const [feedback, setFeedback] = useState("");

  // Stores the structured response returned by the AI. defualt value is null
  const [result, setResult] = useState<Analysis | null>(null);

  // Used to show "Analyzing..." while the API request is running.
  const [loading, setLoading] = useState(false);

  // Stores an error message if something goes wrong.
  const [error, setError] = useState("");

  // This function runs when the user clicks "Analyze feedback".
  async function analyzeFeedback() {

    if (!feedback.trim()) {
      return;
    }

    // Reset the UI before starting a new request.
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Send the feedback to our own backend API route.
  
      // This calls: app/api/analyze/route.ts
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        // Convert the JavaScript object into JSON.
     
        body: JSON.stringify({
          feedback: feedback,
        }),
      });

      // If our API returns an error status like 400 or 500, stop here and move into the catch block below.
      if (!response.ok) {
        throw new Error("Failed to analyze feedback");
      }

      // Convert the JSON response from our backend into a normal JavaScript object.
      const data = await response.json();

      setResult(data);
    } catch (error) {
  
      console.error(error);

      setError(
        "Something went wrong while analyzing the feedback."
      );
    } finally {
      // This runs whether the request succeeded or failed.
      setLoading(false);
    }
  }

  return (
    // Main page container.
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      {/* Keeps the content centered and prevents it becoming too wide. */}
      <div className="mx-auto max-w-3xl">

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

        {/* Customer feedback input area */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <label
            htmlFor="feedback"
            className="block text-sm font-medium text-gray-900"
          >
            Customer feedback
          </label>

          <textarea
            id="feedback"

            // The textarea always displays the value stored in our feedback state.
            value={feedback}

            // Every time the user types, update the feedback state.
            onChange={(event) => setFeedback(event.target.value)}

            placeholder="Example: I tried exporting my report three times and it keeps crashing..."

            className="mt-3 min-h-40 w-full resize-none rounded-xl border border-gray-300 p-4 text-gray-900 outline-none focus:border-gray-900"
          />

          <div className="mt-4 flex items-center justify-between">

            {/* Show the number of characters entered. */}
            <p className="text-sm text-gray-500">
              {feedback.length} characters
            </p>

            <button
              // Call our function when the user clicks the button.
              onClick={analyzeFeedback}

              // Disable the button while loading  or when the text box is empty.
              disabled={loading || !feedback.trim()}

              className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {/* Change the button text while the request is running. */}
              {loading ? "Analyzing..." : "Analyze feedback"}
            </button>

          </div>

        </section>

        {/* Only show this section if an error exists. */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Only show the AI results after we have a result. */}
        {result && (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  AI analysis
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                  Product insight
                </h2>
              </div>

              {/* Only show this badge when the model says human review is needed. */}
              {result.needs_review && (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  Needs review
                </span>
              )}

            </div>

            {/* Grid containing the structured AI classifications. */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <ResultCard
                label="Theme"
                value={result.theme}
              />

              <ResultCard
                label="Type"
                value={result.type}
              />

              <ResultCard
                label="Severity"
                value={result.severity}
              />

              <ResultCard
                label="Sentiment"
                value={result.sentiment}
              />

            </div>

            {/* AI-generated summary */}
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


// Example:
//
// <ResultCard
//   label="Severity"
//   value="high"
// />
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

        {/* Converts values like:
            feature_request
            into:
            feature request
        */}
        {value.replaceAll("_", " ")}

      </p>

    </div>
  );
}