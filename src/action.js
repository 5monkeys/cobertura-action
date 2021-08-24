const core = require("@actions/core");
const github = require("@actions/github");
const { escapeMarkdown } = require("./utils");
const { processCoverage } = require("./cobertura");

const client = new github.getOctokit(
  core.getInput("repo_token", { required: true })
);
const credits = "Results for commit";

async function action(payload) {
  const { pullRequestNumber, commit } = await pullRequestInfo(payload);
  const path = core.getInput("path", { required: true });
  const skipCovered = JSON.parse(
    core.getInput("skip_covered", { required: true })
  );
  const onlySummary = JSON.parse(
    core.getInput("only_summary", { required: true })
  );
  const useAnnotations = JSON.parse(
    core.getInput("use_annotations", { required: true })
  );
  const showLine = JSON.parse(
    core.getInput("show_line", { required: true })
  );
  const showBranch = JSON.parse(
    core.getInput("show_branch", { required: true })
  );
  const minimumCoverage = parseInt(
    core.getInput("minimum_coverage", { required: true })
  );
  const failBelowThreshold = JSON.parse(
    core.getInput("fail_below_threshold", { required: false }) || "false"
  );
  const showClassNames = JSON.parse(
    core.getInput("show_class_names", { required: true })
  );
  const showMissing = JSON.parse(
    core.getInput("show_missing", { required: true })
  );
  let showMissingMaxLength = core.getInput("show_missing_max_length", {
    required: false,
  });
  showMissingMaxLength = showMissingMaxLength
    ? parseInt(showMissingMaxLength)
    : -1;
  const onlyChangedFiles = JSON.parse(
    core.getInput("only_changed_files", { required: true })
  );
  const reportName = core.getInput("report_name", { required: false });

  const changedFiles = onlyChangedFiles
    ? await listChangedFiles(pullRequestNumber)
    : null;

  const reports = await processCoverage(path, { skipCovered });

  if (true === useAnnotations) {
    annotationReport(reports, commit, {
      minimumCoverage,
      showLine,
      showBranch,
      showClassNames,
      showMissing,
      showMissingMaxLength,
      filteredFiles: changedFiles,
      reportName,
      onlySummary,
    });
  }

  if (pullRequestNumber && commit) {
    const comment = markdownReport(reports, commit, {
      minimumCoverage,
      showLine,
      showBranch,
      showClassNames,
      showMissing,
      showMissingMaxLength,
      filteredFiles: changedFiles,
      reportName,
      onlySummary,
    });
    await addComment(pullRequestNumber, comment, reportName);
  } else {
    core.warning("Found no pull request, skipping coverage comment.");
  }

  if (failBelowThreshold) {
    if (reports.some((report) => Math.floor(report.total) < minimumCoverage)) {
      core.setFailed("Minimum coverage requirement was not satisfied");
    }
  }
}

function markdownReport(reports, commit, options) {
  const {
    minimumCoverage = 100,
    showLine = false,
    showBranch = false,
    showClassNames = false,
    showMissing = false,
    showMissingMaxLength = -1,
    filteredFiles = null,
    reportName = "Coverage Report",
    onlySummary = false,
  } = options || {};
  const status = (total) =>
      total >= minimumCoverage ? ":white_check_mark:" : ":x:";
  const crop = (str, at) =>
      str.length > at ? str.slice(0, at).concat("...") : str;
  // Setup files
  const files = [];
  let output = "## Coverage Report\n";
  for (const report of reports) {
    const folder = reports.length <= 1 ? "" : ` ${report.folder}`;
    for (const file of report.files.filter(
        (file) => filteredFiles == null || filteredFiles.includes(file.filename)
    )) {
      const fileTotal = Math.floor(file.total);
      const fileLines = Math.floor(file.line);
      const fileBranch = Math.floor(file.branch);
      const fileMissing =
          showMissingMaxLength > 0
              ? crop(file.missing, showMissingMaxLength)
              : file.missing;
      if (false === onlySummary) {
        files.push([
          escapeMarkdown(showClassNames ? file.name : file.filename),
          `\`${fileTotal}%\``,
          showLine ? `\`${fileLines}%\`` : undefined,
          showBranch ? `\`${fileBranch}%\`` : undefined,
          status(fileTotal),
          showMissing ? (fileMissing ? `\`${fileMissing}\`` : " ") : undefined,
        ]);
      }
    }

    // Construct table
    /*
    | File          | Coverage |                    |
    |---------------|:--------:|:------------------:|
    | **All files** | `78%`    | :x:                |
    | foo.py        | `80%`    | :white_check_mark: |
    | bar.py        | `75%`    | :x:                |

    _Minimum allowed coverage is `80%`_
    */

    const total = Math.floor(report.total);
    const linesTotal = Math.floor(report.line);
    const branchTotal = Math.floor(report.branch);
    const table = [
      [
        "File",
        "Coverage",
        showLine ? "Lines" : undefined,
        showBranch ? "Branches" : undefined,
        " ",
        showMissing ? "Missing" : undefined,
      ],
      [
        "-",
        ":-:",
        showLine ? ":-:" : undefined,
        showBranch ? ":-:" : undefined,
        ":-:",
        showMissing ? ":-:" : undefined,
      ],
      [
        "**All files**",
        `\`${total}%\``,
        showLine ? `\`${linesTotal}%\`` : undefined,
        showBranch ? `\`${branchTotal}%\`` : undefined,
        status(total),
        showMissing ? " " : undefined,
      ],
      ...files,
    ]
        .map((row) => {
          return `| ${row.filter(Boolean).join(" | ")} |`;
        })
        .join("\n");
    const titleText = `<strong>${reportName}${folder}</strong>`;
    output += `${titleText}\n\n${table}\n\n`;
  }
  const minimumCoverageText = `_Minimum allowed coverage is \`${minimumCoverage}%\`_`;
  const footerText = `<p>Results for commit ${commit}.</p>`;
  output += `${minimumCoverageText}\n\n${footerText}`;
  return output;
}

async function addComment(pullRequestNumber, body, reportName) {
  const comments = await client.issues.listComments({
    issue_number: pullRequestNumber,
    ...github.context.repo,
  });
  const commentFilter = reportName ? reportName : credits;
  const comment = comments.data.find((comment) =>
    comment.body.includes(commentFilter)
  );
  if (comment != null) {
    await client.issues.updateComment({
      comment_id: comment.id,
      body: body,
      ...github.context.repo,
    });
  } else {
    await client.issues.createComment({
      issue_number: pullRequestNumber,
      body: body,
      ...github.context.repo,
    });
  }
}

function annotationReport(reports, commit, options) {
  const {
    minimumCoverage = 100,
    showLine = false,
    showBranch = false,
    showClassNames = false,
    showMissing = false,
    showMissingMaxLength = -1,
    filteredFiles = null,
  } = options || {};
  const covered = (total) =>
      total >= minimumCoverage;
  const crop = (str, at) =>
      str.length > at ? str.slice(0, at).concat("...") : str;

  for (const report of reports) {
    for (const file of report.files.filter(
        (file) => filteredFiles == null || filteredFiles.includes(file.filename)
    )) {
      const fileTotal = Math.floor(file.total);
      if (!covered(fileTotal)) {
        const fileLines = Math.floor(file.line);
        const fileBranch = Math.floor(file.branch);
        const fileMissing =
            showMissingMaxLength > 0
                ? crop(file.missing, showMissingMaxLength)
                : file.missing;
        const annotation = [
          escapeMarkdown(showClassNames ? file.name : file.filename),
          `Coverage: ${fileTotal}%`,
          showLine ? `Lines: ${fileLines}%` : undefined,
          showBranch ? `Branches: ${fileBranch}%` : undefined,
          showMissing ? (fileMissing ? `Missing: ${fileMissing}` : " ") : undefined,
        ];
        core.warning(annotation.filter(Boolean).join(", "));
      }
    }
  }
}

async function listChangedFiles(pullRequestNumber) {
  const files = await client.pulls.listFiles({
    pull_number: pullRequestNumber,
    ...github.context.repo,
  });
  return files.data.map((file) => file.filename);
}

/**
 *
 * @param payload
 * @returns {Promise<{pullRequestNumber: number, commit: null}>}
 */
async function pullRequestInfo(payload = {}) {
  let commit = null;
  let pullRequestNumber = core.getInput("pull_request_number", {
    required: false,
  });

  if (pullRequestNumber) {
    // use the supplied PR
    pullRequestNumber = parseInt(pullRequestNumber);
    const { data } = await client.pulls.get({
      pull_number: pullRequestNumber,
      ...github.context.repo,
    });
    commit = data.head.sha;
  } else if (payload.workflow_run) {
    // fetch all open PRs and match the commit hash.
    commit = payload.workflow_run.head_commit.id;
    const { data } = await client.pulls.list({
      ...github.context.repo,
      state: "open",
    });
    pullRequestNumber = data
      .filter((d) => d.head.sha === commit)
      .reduce((n, d) => d.number, "");
  } else if (payload.pull_request) {
    // try to find the PR from payload
    const { pull_request: pullRequest } = payload;
    pullRequestNumber = pullRequest.number;
    commit = pullRequest.head.sha;
  }

  return { pullRequestNumber, commit };
}

module.exports = {
  action,
  markdownReport,
  addComment,
  listChangedFiles,
};
