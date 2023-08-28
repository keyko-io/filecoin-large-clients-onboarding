// .github/scripts/notify_stale_issues.js

import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";

const DAYS_TO_WAIT = 8;
const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
const repo = process.env.GITHUB_REPOSITORY.split('/')[1];

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: {
    fetch: fetch
  }
});

async function setStaleIssues() {

  let issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - DAYS_TO_WAIT);

  // -----------------------------
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
  // -----------------------------
  
  //Let's keep first 6 issues
  issues = issues.slice(0, 6);
  Promise.allSettled(
    issues.map(
      async (issue) => new Promise(
        async (resolve, reject) => {
          const lastComment = await getLastComment(issue.number, DAYS_TO_WAIT, 'github-actions[bot]');
          let updatedAt = lastComment 
            ? new Date(lastComment.created_at) 
            : new Date(issue.updated_at);

          // Let's calculate the difference between the two dates
          const diffTime = dateThreshold - updatedAt;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 0) {
            // await octokit.issues.createComment({
            //   owner,
            //   repo,
            //   issue_number: issue.number,
            //   body: 'This application has not seen any responses in the last 14 days, so for now it is being closed. Please feel free to contact the Fil+ Gov team to re-open the application if it is still being processed. Thank you!'
            // });
            console.log(`Let's close issue ${issue.number}. Last commented ${diffDays} days ago`);
          } else {
            console.log(`Issue ${issue.number} will remain open. Updated ${diffDays} days ago`);
          }
          return resolve();
        }
      )
    )
  );
}

async function getLastComment(issueNumber, daysToWait, botUsername) {
  
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysToWait);

  const sinceDate = dateThreshold.toISOString();

  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
    since: sinceDate,
    per_page: 100
  });

  console.log(comments.map(comment => comment.user.login))
  const nonBotComments = comments.filter(comment => comment.user.login !== botUsername);

  if (nonBotComments.length === 0) {
    return null; // No hay comentarios que no sean del bot en los últimos 10 días.
  }

  // Ordena los comentarios por fecha y selecciona el más reciente.
  nonBotComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return nonBotComments[0];
}

setStaleIssues();

