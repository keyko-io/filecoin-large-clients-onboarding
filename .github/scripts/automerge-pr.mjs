import axios from "axios";

/**
 * This function fetches the list of files changed in a PR.
 * 
 * @param {string} owner 
 * @param {string} repo 
 * @param {number} prNumber 
 * @param {string} githubToken 
 */
async function fetchChangedFiles(owner, repo, prNumber, githubToken) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`;
  const headers = { Authorization: `token ${githubToken}` };

  try {
    const { data } = await axios.get(url, { headers });
    const filenames = data.map((file) => file.filename);
    console.log("Changed files:", filenames);
  } catch (err) {
    console.error("Error fetching changed files:", err);
  }
}

const owner = process.env.OWNER;
const repo = process.env.REPO;
const prNumber = process.env.PR_NUMBER;
const githubToken = process.env.GITHUB_TOKEN;

fetchChangedFiles(owner, repo, prNumber, githubToken);
