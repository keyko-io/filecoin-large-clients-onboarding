// .github/scripts/notify_stale_issues.js

import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: {
    fetch: fetch
  }
});


const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
const repo = process.env.GITHUB_REPOSITORY.split('/')[1];

async function checkAndCommentOnIssues() {
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'open'
  });

  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 0); //change later to 10

  for (const issue of issues) {
    const updatedAt = new Date(issue.updated_at);
    console.log({
      issueNumber: issue.number,
      updatedAt: updatedAt.getTime(),
      tenDaysAgo: tenDaysAgo.getTime(),
    })
    if (updatedAt.getTime() === tenDaysAgo.getTime()) {
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: issue.number,
        body: "This application has not seen any responses in the last 10 days. This issue will be marked with Stale label and will be closed in 4 days. Comment if you want to keep this application open."
      });
    }
  }
}

checkAndCommentOnIssues();