import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(request: Request) {
  try {
    const { feedback } = await request.json();

    if (!feedback || typeof feedback !== "string") {
      return NextResponse.json(
        { error: "Feedback is required" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: `
You analyze customer feedback for a product management team.

Your job is to classify each piece of customer feedback.

TYPE:

bug
Something is broken or is not working as expected.

feature_request
The customer wants new or changed functionality.

praise
The customer is expressing positive feedback.

question
The customer is asking for information.

other
The feedback does not fit the categories above.


SEVERITY:

critical
A core workflow is completely blocked, or there is a major
payment, security, privacy, or data-loss problem.

high
An important workflow is broken and significantly affects
the customer.

medium
The issue creates meaningful friction, but the customer can
still use the product.

low
Minor friction, cosmetic feedback, praise, questions, or
non-urgent feature requests.


THEME:

Choose exactly one:

billing
reporting
search
onboarding
account
performance
other


SENTIMENT:

Choose exactly one:

positive
neutral
negative


NEEDS REVIEW:

Set needs_review to true when:
- the feedback is ambiguous
- there is not enough information
- multiple classifications seem equally plausible

Otherwise set it to false.

SUMMARY:

Write one short sentence describing the actual customer issue.

Do not invent facts that are not present in the feedback.
          `,
        },

        {
          role: "user",
          content: feedback,
        },
      ],

      response_format: {
        type: "json_schema",

        json_schema: {
          name: "feedback_analysis",

          strict: true,

          schema: {
            type: "object",

            properties: {
              theme: {
                type: "string",
                enum: [
                  "billing",
                  "reporting",
                  "search",
                  "onboarding",
                  "account",
                  "performance",
                  "other",
                ],
              },

              type: {
                type: "string",
                enum: [
                  "bug",
                  "feature_request",
                  "praise",
                  "question",
                  "other",
                ],
              },

              severity: {
                type: "string",
                enum: [
                  "critical",
                  "high",
                  "medium",
                  "low",
                ],
              },

              sentiment: {
                type: "string",
                enum: [
                  "positive",
                  "neutral",
                  "negative",
                ],
              },

              summary: {
                type: "string",
              },

              needs_review: {
                type: "boolean",
              },
            },

            required: [
              "theme",
              "type",
              "severity",
              "sentiment",
              "summary",
              "needs_review",
            ],

            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Model returned no content");
    }

    const result = JSON.parse(content);

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong analyzing the feedback" },
      { status: 500 }
    );
  }
}