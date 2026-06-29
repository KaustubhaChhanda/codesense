/**
 * Service to handle communications with GitHub API.
 */

async function fetchDiff(prUrl) {
  const fetchHeaders = {
    Accept: "application/vnd.github.v3.diff",
    "User-Agent": "codesense-app",
  };

  if (process.env.GITHUB_TOKEN) {
    fetchHeaders["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const diffResponse = await fetch(prUrl, {
    headers: fetchHeaders,
  });

  if (!diffResponse.ok) {
    const errorMsg = await diffResponse.text();
    throw new Error(`Failed to fetch diff from GitHub: ${diffResponse.status} ${diffResponse.statusText} - ${errorMsg}`);
  }

  return await diffResponse.text();
}

async function postReviewComment(prUrl, reviewText) {
  if (!process.env.GITHUB_TOKEN) {
    console.log("GITHUB_TOKEN not configured. Skipping posting review comment to GitHub.");
    return;
  }

  console.log("Posting review comment to GitHub PR...");
  const reviewResponse = await fetch(`${prUrl}/reviews`, {
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
}

module.exports = {
  fetchDiff,
  postReviewComment,
};
