const Groq = require("groq-sdk");

async function handleAlert(req, res) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const event = req.headers["x-github-event"];

  if (event === "pull_request") {
    const pr = req.body.pull_request;
    const action = req.body.action;

    if (action === "opened" || action === "synchronize") {
      try {
        const fetchHeaders = {
          Accept: "application/vnd.github.v3.diff",
          "User-Agent": "codesense-app",
        };

        if (process.env.GITHUB_TOKEN) {
          fetchHeaders["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
        }

        const diffResponse = await fetch(pr.url, {
          headers: fetchHeaders,
        });

        if (!diffResponse.ok) {
          throw new Error("Failed to fetch diff");
        }

        const diffText = await diffResponse.text();

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
              content: `PR Title: ${pr.title}\n\nHere is the Git Diff:\n${diffText}`,
            },
          ],
          temperature: 0.2,
        });

        console.log("---AI Code Review---");
        const reviewText = aiResponse.choices?.[0]?.message?.content || "No review content generated";
        console.log(reviewText);
        console.log("--------------------");

        if (process.env.GITHUB_TOKEN) {
          console.log("Posting review comment to GitHub PR...");
          const reviewResponse = await fetch(`${pr.url}/reviews`, {
            method: "POST",
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": "codesense-app",
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              body: reviewText,
              event: "COMMENT",
            }),
          });

          if (!reviewResponse.ok) {
            const errorMsg = await reviewResponse.text();
            throw new Error(`Failed to post review comment: ${reviewResponse.status} ${reviewResponse.statusText} - ${errorMsg}`);
          }
          console.log("Review comment posted successfully to GitHub!");
        } else {
          console.log("GITHUB_TOKEN not configured. Skipping posting review comment to GitHub.");
        }
      } catch (error) {
        console.error("Error during AI Review process: ", error);
      }
    }
  }

  res.status(200).send("Webhook Processed");
}

module.exports = handleAlert;
