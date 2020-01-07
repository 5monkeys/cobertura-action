const nock = require("nock");

const owner = "someowner";
const repo = "somerepo";
const dummyReport = {
  total: 77.5,
  line: 77.5,
  branch: 0,
  files: [
    { filename: "foo.py", total: 80, line: 80, branch: 0 },
    { filename: "bar.py", total: 75, line: 80, branch: 0 }
  ]
};

beforeEach(() => {
  process.env["INPUT_REPO_TOKEN"] = "hunter2";
  process.env["GITHUB_REPOSITORY"] = `${owner}/${repo}`;
});

test("action", async () => {
  const { action } = require("./action");
  process.env["INPUT_PATH"] = "./src/fixtures/test-branch.xml";
  process.env["INPUT_SKIP_COVERED"] = "true";
  process.env["INPUT_SHOW_BRANCH"] = "false";
  process.env["INPUT_SHOW_LINE"] = "false";
  process.env["INPUT_MINIMUM_COVERAGE"] = "100";
  const prNumber = 1;
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200);
  await action({ pull_request: { number: prNumber } });
  await action();
});

test("markdownReport", () => {
  const { markdownReport } = require("./action");
  expect(markdownReport(dummyReport, { minimumCoverage: 70 }))
    .toBe(`| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`78%\` | :white_check_mark: |
| foo.py | \`80%\` | :white_check_mark: |
| bar.py | \`75%\` | :white_check_mark: |

_Minimum allowed coverage is \`70%\`_`);
  expect(markdownReport(dummyReport, { minimumCoverage: 70, showLine: true }))
    .toBe(`| File | Coverage | Lines |   |
| - | :-: | :-: | :-: |
| **All files** | \`78%\` | \`78%\` | :white_check_mark: |
| foo.py | \`80%\` | \`80%\` | :white_check_mark: |
| bar.py | \`75%\` | \`80%\` | :white_check_mark: |

_Minimum allowed coverage is \`70%\`_`);
  expect(markdownReport(dummyReport, { minimumCoverage: 70, showBranch: true }))
    .toBe(`| File | Coverage | Branches |   |
| - | :-: | :-: | :-: |
| **All files** | \`78%\` | \`0%\` | :white_check_mark: |
| foo.py | \`80%\` | \`0%\` | :white_check_mark: |
| bar.py | \`75%\` | \`0%\` | :white_check_mark: |

_Minimum allowed coverage is \`70%\`_`);
  expect(
    markdownReport(dummyReport, {
      minimumCoverage: 70,
      showLine: true,
      showBranch: true
    })
  ).toBe(`| File | Coverage | Lines | Branches |   |
| - | :-: | :-: | :-: | :-: |
| **All files** | \`78%\` | \`78%\` | \`0%\` | :white_check_mark: |
| foo.py | \`80%\` | \`80%\` | \`0%\` | :white_check_mark: |
| bar.py | \`75%\` | \`80%\` | \`0%\` | :white_check_mark: |

_Minimum allowed coverage is \`70%\`_`);
  expect(markdownReport(dummyReport, { minimumCoverage: 80 }))
    .toBe(`| File | Coverage |   |
| - | :-: | :-: |
| **All files** | \`78%\` | :x: |
| foo.py | \`80%\` | :white_check_mark: |
| bar.py | \`75%\` | :x: |

_Minimum allowed coverage is \`80%\`_`);
});

test("addComment", async () => {
  const { addComment } = require("./action");
  const prNumber = "5";
  nock("https://api.github.com")
    .post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`)
    .reply(200);
  await addComment({ number: prNumber }, dummyReport);
});
