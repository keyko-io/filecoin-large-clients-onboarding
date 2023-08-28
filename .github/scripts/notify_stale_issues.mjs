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
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  const tenDaysAgoDateString = tenDaysAgo.toISOString().split('T')[0];
  console.log('Ten days ago: ', tenDaysAgoDateString)

  Promise.allSettled(
    issues.map(
      async (issue) => new Promise(
        async (resolve, reject) => {
          const updatedAt = new Date(issue.updated_at);
          const updatedAtDateString = updatedAt.toISOString().split('T')[0];
          console.log(updatedAtDateString, tenDaysAgoDateString)
          if (updatedAtDateString === tenDaysAgoDateString) {
            // await octokit.issues.createComment({
            //   owner,
            //   repo,
            //   issue_number: issue.number,
            //   body: "This application has not seen any responses in the last 10 days. This issue will be marked with Stale label and will be closed in 4 days. Comment if you want to keep this application open."
            // });
            console.log(`Stale advice on issue ${issue.number}`);
          } else {
            console.log(`No stale advice on issue ${issue.number}`);
          }
          return resolve();
        }
      )
    )
  );
}

checkAndCommentOnIssues();

