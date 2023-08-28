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

  const issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });

  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 3);

  // -----------------------------
  let updatedAt = new Date(issues[0].updated_at);
  let diffTime = Math.abs(tenDaysAgo - updatedAt);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  console.log({
    issue: issues[0].number,
    tenDaysAgoIso: tenDaysAgo.toISOString().split('T')[0],
    tenDaysAgo,
    updatedAt,
    diffTime,
    diffDays
  })

  updatedAt =  new Date(issues[1].updated_at);
  diffTime = Math.abs(tenDaysAgo - updatedAt);
  diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  console.log({
    issue: issues[1].number,
    tenDaysAgoIso: tenDaysAgo.toISOString().split('T')[0],
    tenDaysAgo,
    updatedAt,
    diffTime,
    diffDays
  })

  return;
  // -----------------------------

  Promise.allSettled(
    issues.map(
      async (issue) => new Promise(
        async (resolve, reject) => {
          const updatedAt = new Date(issue.updated_at);

          // Let's calculate the difference between the two dates
          const diffTime = Math.abs(tenDaysAgo - updatedAt);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 10) {
            // await octokit.issues.createComment({
            //   owner,
            //   repo,
            //   issue_number: issue.number,
            //   body: "This application has not seen any responses in the last 10 days. This issue will be marked with Stale label and will be closed in 4 days. Comment if you want to keep this application open."
            // });
            console.log(`Stale advice on issue ${issue.number}. Updated ${diffDays} days ago`);
          } else {
            console.log(`No stale advice on issue ${issue.number}. Updated ${diffDays} days ago`);
          }
          return resolve();
        }
      )
    )
  );
}

checkAndCommentOnIssues();

