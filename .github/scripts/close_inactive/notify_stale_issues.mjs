// .github/scripts/close_inactive/notify_stale_issues.js

import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import { getLastComment } from "./utils.mjs";

const DAYS_TO_WAIT = 10;
const RATE_REMAINING_LIMIT = 100;
const RATE_SLEEP = 1000;
const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
const repo = process.env.GITHUB_REPOSITORY.split('/')[1];

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: {
    fetch: fetch
  }
});

async function checkAndCommentOnIssues() {

  let issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - DAYS_TO_WAIT);

  for (let issue of issues) {
    const rateLimitStatus = await octokit.rateLimit.get();
    const remaining = rateLimitStatus.data.rate.remaining;

    if (remaining < RATE_REMAINING_LIMIT) {
      const sleepTime = RATE_SLEEP;
      console.log(`Issue ${issue.number}: Sleeping for ${sleepTime} ms`);
      await new Promise(resolve => setTimeout(resolve, sleepTime));
    }

    const lastComment = await getLastComment(octokit, owner, repo, issue.number, true);
    if (lastComment && 
      lastComment.user.login == 'github-actions[bot]' && 
      lastComment.body.includes("Commented by Stale Bot.")
    ) continue; //Do not comment again if already commented by bot
    
    const updatedAt = lastComment 
      ? new Date(lastComment.created_at) 
      : new Date(issue.created_at);

    // Let's calculate the difference between the two dates
    const diffTime = dateThreshold - updatedAt;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: issue.number,
        body: `This application has not seen any responses in the last 10 days. This issue will be marked with Stale label and will be closed in 4 days. Comment if you want to keep this application open.
\n\n
--
Commented by Stale Bot.`
      });
      console.log(`Stale advice on issue ${issue.number}. Updated ${diffDays} days ago`);
    } else {
      console.log(`No stale advice on issue ${issue.number}. Updated ${diffDays} days ago`);
    }
  }
}

checkAndCommentOnIssues();

