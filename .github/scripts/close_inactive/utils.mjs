export async function getLastComment(octokit, owner, repo, issueNumber, daysToWait) {
  const botSignature = "Commented by Stale Bot."
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

  const nonBotComments = comments.filter(comment => 
    comment.user.login !== 'github-actions[bot]' ||
    !comment.body.includes(botSignature)
  );
  
  if (nonBotComments.length === 0) {
    return null; // No hay comentarios que no sean del bot en los últimos 10 días.
  }

  // Ordena los comentarios por fecha y selecciona el más reciente.
  nonBotComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return nonBotComments[0];
}
