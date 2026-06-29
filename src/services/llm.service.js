const Groq = require("groq-sdk");

/**
 * Service to handle LLM code review requests.
 */
async function generateReview(prTitle, diffText) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemInstruction = `
        You are an expert Senior Software Engineer performing a code review.
        Analyze the following Git diff from a Pull Request.
        Provide a short, concise code review comment suitable for posting directly as a GitHub Pull Request review summary.
        Highlight key changes, call out any critical bugs, security vulnerabilities, code smells, or performance issues, and state if it is ready to merge.
        Keep the feedback constructive, direct, and formatted in markdown. Do not include conversational preambles (like "Sure, here is the review") or explanations outside of the review comment itself.
        `;

  console.log("Sending diff to Groq for review...");

  const aiResponse = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemInstruction },
      {
        role: "user",
        content: `PR Title: ${prTitle}\n\nHere is the Git Diff:\n${diffText}`,
      },
    ],
    temperature: 0.2,
  });

  return aiResponse.choices?.[0]?.message?.content || "No review content generated";
}

module.exports = {
  generateReview,
};
