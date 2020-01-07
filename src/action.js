const core = require("@actions/core");
const github = require("@actions/github");
const { processCoverage } = require("./cobertura");

const client = new github.GitHub(
  core.getInput("repo_token", { required: true })
);

async function action(payload) {
  const { pull_request: pullRequest } = payload || {};
  if (pullRequest == null) {
    core.error("Found no pull request.");
    return;
  }
  const path = core.getInput("path", { required: true });
  const skipCovered = JSON.parse(
    core.getInput("skip_covered", { required: true })
  );
  const showLine = JSON.parse(core.getInput("show_line", { required: true }));
  const showBranch = JSON.parse(
    core.getInput("show_branch", { required: true })
  );
  const minimumCoverage = parseInt(
    core.getInput("minimum_coverage", { required: true })
  );
  const report = await processCoverage(path, { skipCovered });
  await addComment(pullRequest, report, {
    minimumCoverage,
    showLine,
    showBranch
  });
}

function markdownReport(report, options) {
  const { minimumCoverage = 100, showLine = false, showBranch = false } =
    options || {};
  const status = total =>
    total >= minimumCoverage ? ":white_check_mark:" : ":x:";
  // Setup files
  const files = [];
  for (const file of report.files) {
    const fileTotal = Math.round(file.total);
    const fileLines = Math.round(file.line);
    const fileBranch = Math.round(file.branch);
    files.push([
      file.filename,
      `\`${fileTotal}%\``,
      showLine ? `\`${fileLines}%\`` : undefined,
      showBranch ? `\`${fileBranch}%\`` : undefined,
      status(fileTotal)
    ]);
  }
  // Construct table
  const total = Math.round(report.total);
  const linesTotal = Math.round(report.line);
  const branchTotal = Math.round(report.branch);
  const table = [
    [
      "File",
      "Coverage",
      showLine ? "Lines" : undefined,
      showBranch ? "Branches" : undefined,
      " "
    ],
    [
      "-",
      ":-:",
      showLine ? ":-:" : undefined,
      showBranch ? ":-:" : undefined,
      ":-:"
    ],
    [
      "**All files**",
      `\`${total}%\``,
      showLine ? `\`${linesTotal}%\`` : undefined,
      showBranch ? `\`${branchTotal}%\`` : undefined,
      status(total)
    ],
    ...files
  ]
    .map(row => {
      return `| ${row.filter(Boolean).join(" | ")} |`;
    })
    .join("\n");
  return `${table}\n\n_Minimum allowed coverage is \`${minimumCoverage}%\`_`;
}

async function addComment(pullRequest, report, options) {
  const comment = markdownReport(report, options);
  await client.issues.createComment({
    issue_number: pullRequest.number,
    body: comment,
    ...github.context.repo
  });
}

module.exports = {
  action,
  markdownReport,
  addComment
};
