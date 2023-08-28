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

  console.log('There are ', issues.length, ' issues open')
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  Promise.allSettled(
    issues.map(
      async (issue) => new Promise(
        async (resolve, reject) => {
          const updatedAt = new Date(issue.updated_at);

          // Let's calculate the difference between the two dates
          const diffTime = Math.abs(updatedAt - tenDaysAgo);
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

