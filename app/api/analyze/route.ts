import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const feedback = body.feedback;

    const response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input: `
You are a product manager analyzing customer feedback.

Customer feedback:
"${feedback}"

In one sentence, tell me what the main customer problem is.
      `,
    });

    return NextResponse.json({
      analysis: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}