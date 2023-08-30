const RATE_REMAINING_LIMIT = 100;

export async function getLastComment(octokit, owner, repo, issueNumber, includeBot) {
  const botSignature = "Commented by Stale Bot."

  let comments = await octokit.paginate(octokit.issues.listComments, {
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100
  });
  
  if (!comments || comments.length === 0) {
    return null; // Issue has no comments.
  }

  if (!includeBot) {
    comments = comments.filter(comment => 
      !(comment.user.login === 'github-actions[bot]' && 
      comment.body.includes(botSignature))
    );
  }

  // Order comments by date desc.
  comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return comments[0];
}

export async function checkThrottling(octokit) {
  const rateLimitStatus = await octokit.rateLimit.get();
  const remaining = rateLimitStatus.data.rate.remaining;

  if (remaining < RATE_REMAINING_LIMIT) {
    const timestampNow = new Date().getTime()
    const timestampReset = rateLimitStatus.data.rate.reset * 1000
    const sleepTime = (timestampReset - timestampNow)

    const sleepTimeStringInMinutesAndSeconds = new Date(sleepTime).toISOString().substr(14, 5);
    console.log(`Rate limit reached. Throttling for ${sleepTimeStringInMinutesAndSeconds} ms`);
    await new Promise(resolve => setTimeout(resolve, sleepTime));
  }
}