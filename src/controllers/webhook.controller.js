const githubService = require("../services/github.service");
const llmService = require("../services/llm.service");

/**
 * Controller to handle webhook HTTP requests.
 */
async function handleAlert(req, res) {
  const event = req.headers["x-github-event"];

  if (event === "pull_request") {
    const pr = req.body.pull_request;
    const action = req.body.action;

    if (action === "opened" || action === "synchronize") {
      try {
        // 1. Fetch the PR diff text from GitHub
        const diffText = await githubService.fetchDiff(pr.url);

        // 2. Generate code review via LLM service
        const reviewText = await llmService.generateReview(pr.title, diffText);

        console.log("---AI Code Review---");
        console.log(reviewText);
        console.log("--------------------");

        // 3. Post the review comment back to GitHub
        await githubService.postReviewComment(pr.url, reviewText);
      } catch (error) {
        console.error("Error during AI Review process: ", error.message);
      }
    }
  }

  res.status(200).send("Webhook Processed");
}

module.exports = handleAlert;
