const Groq = require("groq-sdk");

async function handleAlert(req, res) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const event = req.headers["x-github-event"];

  if (event === "pull_request") {
    const pr = req.body.pull_request;
    const action = req.body.action;

    if (action === "opened" || action === "synchronize") {
      try {
        const diffResponse = await fetch(pr.url, {
          headers: {
            Accept: "application/vnd.github.v3.diff",
          },
        });

        if (!diffResponse.ok) {
          throw new Error("Failed to fetch diff");
        }

        const diffText = await diffResponse.text();

        const systemInstruction = `
        You are an expert Senior Software Engineer performing a code review.
        Analyze the following Git diff from a Pull Request.
        Provide a concise summary of the changes and evaluate if the PR is good enough to merge.
        Check for bugs, security vulnerabilities, code smells, or performance issues.
        Be constructive and direct. Keep your response clear and formatted in markdown.
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
        console.log(aiResponse.text);
        console.log("--------------------");
      } catch (error) {
        console.error("Error during AI Review process: ", error);
      }
    }
  }

  res.status(200).send("Webhook Processed");
}

module.exports = handleAlert;
