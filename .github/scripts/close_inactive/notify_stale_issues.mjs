// .github/scripts/close_inactive/notify_stale_issues.js

import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import { getLastComment } from "./utils.mjs";

const DAYS_TO_WAIT = 1;

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: {
    fetch: fetch
  }
});


const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
const repo = process.env.GITHUB_REPOSITORY.split('/')[1];

async function checkAndCommentOnIssues() {

  let issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - DAYS_TO_WAIT);

  // // -----------------------------
  // let updatedAt = new Date(issues[0].updated_at);
  // let diffTime = dateThreshold - updatedAt;
  // let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // console.log({
  //   issue: issues[0].number,
  //   dateThresholdIso: dateThreshold.toISOString().split('T')[0],
  //   dateThreshold,
  //   updatedAt,
  //   diffTime,
  //   diffDays
  // })

  // updatedAt =  new Date(issues[1].updated_at);
  // diffTime = dateThreshold - updatedAt;
  // diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // console.log({
  //   issue: issues[1].number,
  //   dateThresholdIso: dateThreshold.toISOString().split('T')[0],
  //   dateThreshold,
  //   updatedAt,
  //   diffTime,
  //   diffDays
  // })

  // return;
  // // -----------------------------
  
  //Let's keep first 4 issues
  issues = issues.slice(0, 4);
  Promise.allSettled(
    issues.map(
      async (issue) => new Promise(
        async (resolve, reject) => {
          const updatedAt = new Date(issue.updated_at);

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
          return resolve();
        }
      )
    )
  );
}

checkAndCommentOnIssues();

