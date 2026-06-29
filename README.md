# Codesense

Codesense is a backend service that automates code reviews on GitHub Pull Requests using AI.

## How it works
1. It listens for GitHub webhook events (when a pull request is opened or synchronized).
2. It fetches the code diff of the pull request from GitHub.
3. It sends the code diff to an LLM (using the Groq SDK) for analysis.
4. It receives a concise code review comment from the AI.
5. It posts the review comment directly back to the pull request on GitHub.

## Setup and Running

### Run These Commands
```bash
npm run start
npx ngrok http 3000
```

### Next Steps
1. Copy the forwarding link from the `ngrok` terminal (e.g. `https://your-subdomain.ngrok-free.app`).
2. Add this URL to the **Webhooks** section of your GitHub repository setting, appending `/webhook` to the end of the URL (e.g., `https://your-subdomain.ngrok-free.app/webhook`).
3. Set the content type to `application/json` and select the **Pull requests** event.
4. Make sure you have configured `GROQ_API_KEY` and `GITHUB_TOKEN` in your `.env` file.
5. Create a Pull Request or sync/push new code to it, and watch the AI review comment appear on the PR.
