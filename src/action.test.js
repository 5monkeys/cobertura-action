const nock = require("nock");

const owner = "someowner";
const repo = "somerepo";
const dummyReport = {
  total: 77.5,
  line: 77.5,
  branch: 0,
  files: [
    {
      name: "ClassFoo",
      filename: "__init__.py",
      total: 80,
      line: 80,
      branch: 0,
      missing: "24-26",
    },
    {
      name: "ClassBar",
      filename: "bar.py",
      total: 75,
      line: 80,
      branch: 0,
      missing: "23-24, 39-40",
    },
    {
      name: "ClassMoo",
      filename: "foo.py",
      total: 75,
      line: 100,
      branch: 75,
      missing: "",
    },
  ],
};

beforeEach(() => {
  process.env["INPUT_REPO_TOKEN"] = "hunter2";
  process.env["GITHUB_REPOSITORY"] = `${owner}/${repo}`;
  process.exitCode = 0;
  process.stdout.write = jest.fn();
});

test("action", async () => {
  const { action } = require("./action");
  process.env["INPUT_PATH"] = "./src/fixtures/test-branch.xml";
  process.env["INPUT_SKIP_COVERED"] = "true";
  process.env["INPUT_SHOW_BRANCH"] = "false";
  process.env["INPUT_SHOW_LINE"] = "false";
  process.env["INPUT_MINIMUM_COVERAGE"] = "100";
  process.env["INPUT_SHOW_CLASS_NAMES"] = "false";
  process.env["INPUT_SHOW_MISSING"] = "false";
  process.env["INPUT_ONLY_CHANGED_FILES"] = "false";
  process.env["INPUT_PULL_REQUEST_NUMBER"] = "";
  const prNumber = 1;
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: "some body", id: 123 }]);
  await action({
    pull_request: { number: prNumber, head: { sha: "deadbeef" } },
  });
  await action();
});

test("action triggered by workflow event", async () => {
  const { action } = require("./action");
  process.env["INPUT_PATH"] = "./src/fixtures/test-branch.xml";
  process.env["INPUT_SKIP_COVERED"] = "true";
  process.env["INPUT_SHOW_BRANCH"] = "false";
  process.env["INPUT_SHOW_LINE"] = "false";
  process.env["INPUT_MINIMUM_COVERAGE"] = "100";
  process.env["INPUT_SHOW_CLASS_NAMES"] = "false";
  process.env["INPUT_ONLY_CHANGED_FILES"] = "false";
  process.env["INPUT_PULL_REQUEST_NUMBER"] = "";
  const prNumber = 1;
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: "some body", id: 123 }])
    .get(`/repos/${owner}/${repo}/pulls?state=open`)
    .reply(200, [
      {
        number: 1,
        head: {
          sha: "deadbeef",
        },
      },
    ]);
  await action({
    workflow_run: { head_commit: { id: "deadbeef" } },
  });
});

test("action passing pull request number directly", async () => {
  const { action } = require("./action");
  const prNumber = 123;
  process.env["INPUT_PATH"] = "./src/fixtures/test-branch.xml";
  process.env["INPUT_SKIP_COVERED"] = "true";
  process.env["INPUT_SHOW_BRANCH"] = "false";
  process.env["INPUT_SHOW_LINE"] = "false";
  process.env["INPUT_MINIMUM_COVERAGE"] = "100";
  process.env["INPUT_SHOW_CLASS_NAMES"] = "false";
  process.env["INPUT_SHOW_MISSING"] = "false";
  process.env["INPUT_ONLY_CHANGED_FILES"] = "false";
  process.env["INPUT_PULL_REQUEST_NUMBER"] = prNumber;
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: "some body", id: 123 }])
    .get(`/repos/${owner}/${repo}/pulls/${prNumber}`)
    .reply(200, {
      head: {
        sha: "deadbeef",
      },
    });
  await action({
    push: { ref: "master" },
  });
});

test("action only changes", async () => {
  const { action } = require("./action");
  process.env["INPUT_PATH"] = "./src/fixtures/test-branch.xml";
  process.env["INPUT_SKIP_COVERED"] = "true";
  process.env["INPUT_SHOW_BRANCH"] = "false";
  process.env["INPUT_SHOW_LINE"] = "false";
  process.env["INPUT_MINIMUM_COVERAGE"] = "100";
  process.env["INPUT_SHOW_CLASS_NAMES"] = "false";
  process.env["INPUT_SHOW_MISSING"] = "false";
  process.env["INPUT_ONLY_CHANGED_FILES"] = "true";
  process.env["INPUT_PULL_REQUEST_NUMBER"] = "";
  const prNumber = 1;
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: "some body", id: 123 }])
    .get(`/repos/${owner}/${repo}/pulls/${prNumber}/files`)
    .reply(200, [
      {
        filename: "file1.txt",
      },
    ]);
  await action({
    pull_request: { number: prNumber, head: { sha: "deadbeef" } },
  });
  await action();
});

test("action with report name", async () => {
  const { action } = require("./action");
  process.env["INPUT_PATH"] = "./src/fixtures/test-branch.xml";
  process.env["INPUT_SKIP_COVERED"] = "true";
  process.env["INPUT_SHOW_BRANCH"] = "false";
  process.env["INPUT_SHOW_LINE"] = "false";
  process.env["INPUT_MINIMUM_COVERAGE"] = "100";
  process.env["INPUT_SHOW_CLASS_NAMES"] = "false";
  process.env["INPUT_SHOW_MISSING"] = "false";
  process.env["INPUT_ONLY_CHANGED_FILES"] = "true";
  process.env["INPUT_REPORT_NAME"] = "Test Report";
  const prNumber = 1;
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: "some body", id: 123 }])
    .get(`/repos/${owner}/${repo}/pulls/${prNumber}/files`)
    .reply(200, [
      {
        filename: "file1.txt",
      },
    ]);
  await action({
    pull_request: { number: prNumber, head: { sha: "deadbeef" } },
  });
  await action();
});

test("action with crop missing lines", async () => {
  const { action } = require("./action");
  process.env["INPUT_PATH"] = "./src/fixtures/test-branch.xml";
  process.env["INPUT_SKIP_COVERED"] = "true";
  process.env["INPUT_SHOW_BRANCH"] = "false";
  process.env["INPUT_SHOW_LINE"] = "false";
  process.env["INPUT_MINIMUM_COVERAGE"] = "100";
  process.env["INPUT_SHOW_CLASS_NAMES"] = "false";
  process.env["INPUT_SHOW_MISSING"] = "true";
  process.env["INPUT_SHOW_MISSING_MAX_LENGTH"] = "10";
  process.env["INPUT_ONLY_CHANGED_FILES"] = "false";
  process.env["INPUT_PULL_REQUEST_NUMBER"] = "";
  const prNumber = 1;
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: "some body", id: 123 }]);
  await action({
    pull_request: { number: prNumber, head: { sha: "deadbeef" } },
  });
  await action();
});

test("action failing on coverage below threshold", async () => {
  const { action } = require("./action");
  const prNumber = 123;
  process.env["INPUT_PATH"] = "./src/fixtures/test-branch.xml";
  process.env["INPUT_SKIP_COVERED"] = "true";
  process.env["INPUT_SHOW_BRANCH"] = "false";
  process.env["INPUT_SHOW_LINE"] = "false";
  process.env["INPUT_MINIMUM_COVERAGE"] = "100";
  process.env["INPUT_FAIL_BELOW_THRESHOLD"] = "true";
  process.env["INPUT_SHOW_CLASS_NAMES"] = "false";
  process.env["INPUT_SHOW_MISSING"] = "false";
  process.env["INPUT_ONLY_CHANGED_FILES"] = "false";
  process.env["INPUT_PULL_REQUEST_NUMBER"] = prNumber;
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: "some body", id: 123 }])
    .get(`/repos/${owner}/${repo}/pulls/${prNumber}`)
    .reply(200, {
      head: {
        sha: "deadbeef",
      },
    });
  await action({
    push: { ref: "master" },
  });
  expect(process.exitCode).toBe(1);
  expect(process.stdout.write).toHaveBeenCalledTimes(1);
  expect(process.stdout.write).toHaveBeenCalledWith(
    "::error::Minimum coverage requirement was not satisfied\n"
  );
});

test("action not failing on coverage at threshold", async () => {
  const { action } = require("./action");
  const prNumber = 123;
  process.env["INPUT_PATH"] = "./src/fixtures/test-branch.xml";
  process.env["INPUT_SKIP_COVERED"] = "true";
  process.env["INPUT_SHOW_BRANCH"] = "false";
  process.env["INPUT_SHOW_LINE"] = "false";
  process.env["INPUT_MINIMUM_COVERAGE"] = "82";
  process.env["INPUT_FAIL_BELOW_THRESHOLD"] = "true";
  process.env["INPUT_SHOW_CLASS_NAMES"] = "false";
  process.env["INPUT_SHOW_MISSING"] = "false";
  process.env["INPUT_ONLY_CHANGED_FILES"] = "false";
  process.env["INPUT_PULL_REQUEST_NUMBER"] = prNumber;
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: "some body", id: 123 }])
    .get(`/repos/${owner}/${repo}/pulls/${prNumber}`)
    .reply(200, {
      head: {
        sha: "deadbeef",
      },
    });
  await action({
    push: { ref: "master" },
  });
  expect(process.exitCode).toBe(0);
  expect(process.stdout.write).toHaveBeenCalledTimes(0);
});

test("markdownReport", () => {
  const { markdownReport } = require("./action");
  const commit = "deadbeef";
  const reportName = "TestReport";
  const defaultReportName = "Coverage Report";
  expect(
    markdownReport([dummyReport], commit, {
      minimumCoverage: 70,
      reportName: reportName,
    })
  ).toBe(`<strong>${reportName}</strong>

| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`77%\` | :white_check_mark: |
| \\_\\_init\\_\\_.py | \`80%\` | :white_check_mark: |
| bar.py | \`75%\` | :white_check_mark: |
| foo.py | \`75%\` | :white_check_mark: |

_Minimum allowed coverage is \`70%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(markdownReport([dummyReport], commit))
    .toBe(`<strong>${defaultReportName}</strong>

| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`77%\` | :x: |
| \\_\\_init\\_\\_.py | \`80%\` | :x: |
| bar.py | \`75%\` | :x: |
| foo.py | \`75%\` | :x: |

_Minimum allowed coverage is \`100%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(
    markdownReport([dummyReport], commit, {
      minimumCoverage: 70,
      showLine: true,
    })
  ).toBe(`<strong>${defaultReportName}</strong>

| File | Coverage | Lines |   |
| - | :-: | :-: | :-: |
| **All files** | \`77%\` | \`77%\` | :white_check_mark: |
| \\_\\_init\\_\\_.py | \`80%\` | \`80%\` | :white_check_mark: |
| bar.py | \`75%\` | \`80%\` | :white_check_mark: |
| foo.py | \`75%\` | \`100%\` | :white_check_mark: |

_Minimum allowed coverage is \`70%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(
    markdownReport([dummyReport], commit, {
      minimumCoverage: 70,
      showBranch: true,
    })
  ).toBe(`<strong>${defaultReportName}</strong>

| File | Coverage | Branches |   |
| - | :-: | :-: | :-: |
| **All files** | \`77%\` | \`0%\` | :white_check_mark: |
| \\_\\_init\\_\\_.py | \`80%\` | \`0%\` | :white_check_mark: |
| bar.py | \`75%\` | \`0%\` | :white_check_mark: |
| foo.py | \`75%\` | \`75%\` | :white_check_mark: |

_Minimum allowed coverage is \`70%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(
    markdownReport([dummyReport], commit, {
      minimumCoverage: 70,
      showLine: true,
      showBranch: true,
    })
  ).toBe(`<strong>${defaultReportName}</strong>

| File | Coverage | Lines | Branches |   |
| - | :-: | :-: | :-: | :-: |
| **All files** | \`77%\` | \`77%\` | \`0%\` | :white_check_mark: |
| \\_\\_init\\_\\_.py | \`80%\` | \`80%\` | \`0%\` | :white_check_mark: |
| bar.py | \`75%\` | \`80%\` | \`0%\` | :white_check_mark: |
| foo.py | \`75%\` | \`100%\` | \`75%\` | :white_check_mark: |

_Minimum allowed coverage is \`70%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(
    markdownReport([dummyReport], commit, {
      minimumCoverage: 70,
      showLine: true,
      showBranch: true,
      showMissing: true,
    })
  ).toBe(`<strong>${defaultReportName}</strong>

| File | Coverage | Lines | Branches |   | Missing |
| - | :-: | :-: | :-: | :-: | :-: |
| **All files** | \`77%\` | \`77%\` | \`0%\` | :white_check_mark: |   |
| \\_\\_init\\_\\_.py | \`80%\` | \`80%\` | \`0%\` | :white_check_mark: | \`24-26\` |
| bar.py | \`75%\` | \`80%\` | \`0%\` | :white_check_mark: | \`23-24, 39-40\` |
| foo.py | \`75%\` | \`100%\` | \`75%\` | :white_check_mark: |   |

_Minimum allowed coverage is \`70%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(
    markdownReport([dummyReport], commit, {
      minimumCoverage: 70,
      showLine: true,
      showBranch: true,
      showMissing: true,
      showMissingMaxLength: 5,
    })
  ).toBe(`<strong>${defaultReportName}</strong>

| File | Coverage | Lines | Branches |   | Missing |
| - | :-: | :-: | :-: | :-: | :-: |
| **All files** | \`77%\` | \`77%\` | \`0%\` | :white_check_mark: |   |
| \\_\\_init\\_\\_.py | \`80%\` | \`80%\` | \`0%\` | :white_check_mark: | \`24-26\` |
| bar.py | \`75%\` | \`80%\` | \`0%\` | :white_check_mark: | \`23-24...\` |
| foo.py | \`75%\` | \`100%\` | \`75%\` | :white_check_mark: |   |

_Minimum allowed coverage is \`70%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(markdownReport([dummyReport], commit, { minimumCoverage: 80 }))
    .toBe(`<strong>${defaultReportName}</strong>

| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`77%\` | :x: |
| \\_\\_init\\_\\_.py | \`80%\` | :white_check_mark: |
| bar.py | \`75%\` | :x: |
| foo.py | \`75%\` | :x: |

_Minimum allowed coverage is \`80%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(markdownReport([dummyReport], commit, { showClassNames: true }))
    .toBe(`<strong>${defaultReportName}</strong>

| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`77%\` | :x: |
| ClassFoo | \`80%\` | :x: |
| ClassBar | \`75%\` | :x: |
| ClassMoo | \`75%\` | :x: |

_Minimum allowed coverage is \`100%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(markdownReport([dummyReport], commit, { filteredFiles: ["bar.py"] }))
    .toBe(`<strong>${defaultReportName}</strong>

| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`77%\` | :x: |
| bar.py | \`75%\` | :x: |

_Minimum allowed coverage is \`100%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(
    markdownReport([dummyReport], commit, { filteredFiles: ["README.md"] })
  ).toBe(`<strong>${defaultReportName}</strong>

| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`77%\` | :x: |

_Minimum allowed coverage is \`100%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(markdownReport([dummyReport], commit, { filteredFiles: [] }))
    .toBe(`<strong>${defaultReportName}</strong>

| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`77%\` | :x: |

_Minimum allowed coverage is \`100%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);

  expect(
    markdownReport(
      [
        {
          folder: "foo.xml",
          ...dummyReport,
        },
        {
          folder: "bar.xml",
          ...dummyReport,
        },
      ],
      commit,
      { filteredFiles: [] }
    )
  ).toBe(`<strong>${defaultReportName} foo.xml</strong>

| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`77%\` | :x: |

<strong>${defaultReportName} bar.xml</strong>

| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`77%\` | :x: |

_Minimum allowed coverage is \`100%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`);
});

test("addComment", async () => {
  const { addComment } = require("./action");
  const prNumber = "5";
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: "some body", id: 123 }]);
  await addComment(prNumber, "foo", "bar");
});

test("addComment with update", async () => {
  const { addComment } = require("./action");
  const prNumber = "5";
  const commentId = 123;
  const oldComment = `<strong>bar</strong>

| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`78%\` | :x: |

_Minimum allowed coverage is \`100%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`;

  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: oldComment, id: commentId }])
    .patch(`/repos/${owner}/${repo}/issues/comments/${commentId}`)
    .reply(200, [{ body: oldComment, id: commentId }]);
  await addComment(prNumber, "foo", "bar");
});

test("addComment for specific report", async () => {
  const { addComment } = require("./action");
  const prNumber = "5";
  const commentId = 123;
  const report1Comment = `Report1
| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`78%\` | :x: |

_Minimum allowed coverage is \`100%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`;

  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [{ body: report1Comment, id: commentId }]);
  await addComment(prNumber, "foo", "Report2");
});

test("addComment with update for specific report", async () => {
  const { addComment } = require("./action");
  const prNumber = "5";
  const comment1Id = 123;
  const comment2Id = 456;
  const report1Comment = `Report1
| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`78%\` | :x: |

_Minimum allowed coverage is \`100%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`;
  const report2Comment = `Report2
| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`82%\` | :x: |

_Minimum allowed coverage is \`100%\`_

<p align="right">Generated by :monkey: cobertura-action against deadbeef </p>`;

  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200)
    .get(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200, [
      { body: report1Comment, id: comment1Id },
      { body: report2Comment, id: comment2Id },
    ])
    .patch(`/repos/${owner}/${repo}/issues/comments/${comment2Id}`)
    .reply(200, [{ body: report2Comment, id: comment2Id }]);
  await addComment(prNumber, "foo", "Report2");
});

test("listChangedFiles", async () => {
  const { listChangedFiles } = require("./action");
  const prNumber = "5";
  nock("https://api.github.com")
    .get(`/repos/${owner}/${repo}/pulls/${prNumber}/files`)
    .reply(200, [
      {
        filename: "file1.txt",
      },
    ]);
  await listChangedFiles(prNumber);
});
