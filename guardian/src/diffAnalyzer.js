const { octokit, getRepoContext } = require("./githubClient");

async function getChangedFiles() {
  const { owner, repo, prNumber } = getRepoContext();

  if (!prNumber) {
    console.log("No PR context detected. Skipping.");
    return [];
  }

  const files = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
      per_page: perPage,
      page
    });

    if (res.data.length === 0) break;

    for (const f of res.data) {
      files.push({ filename: f.filename, status: f.status || "modified" });
    }

    if (res.data.length < perPage) break;
    page++;
  }

  return files;
}

function classifyFile(filename) {
  if (filename.startsWith("client")) return "client";
  if (filename.startsWith("server")) return "server";
  if (
    filename.startsWith("config") ||
    filename.startsWith(".github") ||
    filename.includes("docker")
  ) return "config";
  return "other";
}

module.exports = {
  getChangedFiles,
  classifyFile
};

