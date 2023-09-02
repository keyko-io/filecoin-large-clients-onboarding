import axios from "axios";
import { Buffer } from "buffer";

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
    console.log('Changed files:', filenames);

    if (filenames.length === 1 && filenames[0].endsWith('.json')) {
      console.log('A single JSON file has been modified.');
      const fileSha = data[0].sha;
      const fileContent = await fetchFileContent(owner, repo, fileSha, githubToken);
      console.log('Content of the modified JSON file:', fileContent);
    } else {
      console.log('Either multiple files are modified or the modified file is not a JSON.');
    }
  } catch (err) {
    console.error('Error fetching changed files:', err);
  }
}

/**
 * 
 * @param {string} owner 
 * @param {string} repo 
 * @param {string} filePath 
 * @param {string} githubToken 
 * @returns 
 */
async function fetchFileContent(owner, repo, sha, githubToken) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`;
  const headers = { Authorization: `token ${githubToken}` };

  try {
    const { data } = await axios.get(url, { headers });
    const fileContent = Buffer.from(data.content, 'base64').toString('utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    console.error('Error fetching file content:', err);
  }
}

const owner = process.env.OWNER;
const repo = process.env.REPO;
const prNumber = process.env.PR_NUMBER;
const githubToken = process.env.GITHUB_TOKEN;

fetchChangedFiles(owner, repo, prNumber, githubToken);
