const {
  processCoverage,
  trimFolder,
  longestCommonPrefix,
} = require("./cobertura");

test("multiple files", async () => {
  const reports = await processCoverage("./src/fixtures/*-branch.xml");
  expect(reports.length).toBe(2);
  expect(reports[0].folder).toBe("test-branch.xml");
  expect(reports[1].folder).toBe("test-no-branch.xml");
});

test("processCoverage(test-branch.xml, {skipCovered: false})", async () => {
  const reports = await processCoverage("./src/fixtures/test-branch.xml");
  expect(reports.length).toBe(1);
  expect(reports[0].total).toBe(82.5);
  const files = reports[0].files;
  expect(files.length).toBe(4);

  expect(files[0].total).toBe(100);
  expect(files[0].branch).toBe(100);
  expect(files[0].line).toBe(100);
  expect(files[0].filename).toBe("Main.java");
  expect(files[0].name).toBe("Main");

  expect(files[1].total).toBe(87.5);
  expect(files[1].branch).toBe(83.33333333333334);
  expect(files[1].line).toBe(91.66666666666666);
  expect(files[1].filename).toBe("search/BinarySearch.java");
  expect(files[1].name).toBe("search.BinarySearch");

  expect(files[2].total).toBe(100);
  expect(files[2].branch).toBe(100);
  expect(files[2].line).toBe(100);
  expect(files[2].filename).toBe("search/ISortedArraySearch.java");
  expect(files[2].name).toBe("search.ISortedArraySearch");

  expect(files[3].total).toBe(69.04761904761904);
  expect(files[3].branch).toBe(66.66666666666666);
  expect(files[3].line).toBe(71.42857142857143);
  expect(files[3].filename).toBe("search/LinearSearch.java");
  expect(files[3].name).toBe("search.LinearSearch");
});

test("processCoverage({skipCovered: true})", async () => {
  const reports = await processCoverage("./src/fixtures/test-branch.xml", {
    skipCovered: true,
  });
  expect(reports.length).toBe(1);
  expect(reports[0].total).toBe(82.5);
  const files = reports[0].files;
  expect(files.length).toBe(2);

  expect(files[0].total).toBe(87.5);
  expect(files[0].branch).toBe(83.33333333333334);
  expect(files[0].line).toBe(91.66666666666666);
  expect(files[0].filename).toBe("search/BinarySearch.java");
  expect(files[0].name).toBe("search.BinarySearch");

  expect(files[1].total).toBe(69.04761904761904);
  expect(files[1].branch).toBe(66.66666666666666);
  expect(files[1].line).toBe(71.42857142857143);
  expect(files[1].filename).toBe("search/LinearSearch.java");
  expect(files[1].name).toBe("search.LinearSearch");
});

test("processCoverage(test-branch.xml, {skipCovered: true})", async () => {
  const reports = await processCoverage("./src/fixtures/test-branch.xml", {
    skipCovered: true,
  });
  expect(reports[0].total).toBe(82.5);
  const files = reports[0].files;
  expect(files.length).toBe(2);

  expect(files[0].total).toBe(87.5);
  expect(files[0].branch).toBe(83.33333333333334);
  expect(files[0].line).toBe(91.66666666666666);
  expect(files[0].filename).toBe("search/BinarySearch.java");
  expect(files[0].name).toBe("search.BinarySearch");

  expect(files[1].total).toBe(69.04761904761904);
  expect(files[1].branch).toBe(66.66666666666666);
  expect(files[1].line).toBe(71.42857142857143);
  expect(files[1].filename).toBe("search/LinearSearch.java");
  expect(files[1].name).toBe("search.LinearSearch");
});

test("processCoverage(test-no-branch.xml, {skipCovered: true})", async () => {
  const reports = await processCoverage("./src/fixtures/test-no-branch.xml", {
    skipCovered: true,
  });
  expect(reports[0].total).toBe(90);
  const files = reports[0].files;
  expect(files.length).toBe(2);

  expect(files[0].total).toBe(91.66666666666666);
  expect(files[0].branch).toBe(0);
  expect(files[0].line).toBe(91.66666666666666);
  expect(files[0].filename).toBe("search/BinarySearch.java");
  expect(files[0].name).toBe("search.BinarySearch");

  expect(files[1].total).toBe(71.42857142857143);
  expect(files[1].branch).toBe(0);
  expect(files[1].line).toBe(71.42857142857143);
  expect(files[1].filename).toBe("search/LinearSearch.java");
  expect(files[1].name).toBe("search.LinearSearch");
});

test("processCoverage(test-istanbul.xml, {skipCovered: false})", async () => {
  const reports = await processCoverage("./src/fixtures/test-istanbul.xml", {
    skipCovered: false,
  });
  expect(reports[0].total).toBe(100);
  const files = reports[0].files;
  expect(files.length).toBe(2);

  expect(files[0].total).toBe(100);
  expect(files[0].branch).toBe(100);
  expect(files[0].line).toBe(100);
  expect(files[0].filename).toBe("src/action.js");
  expect(files[0].name).toBe("action.js");

  expect(files[1].total).toBe(100);
  expect(files[1].branch).toBe(100);
  expect(files[1].line).toBe(100);
  expect(files[1].filename).toBe("src/cobertura.js");
  expect(files[1].name).toBe("cobertura.js");
});

test("processCoverage(test-istanbul-single.xml, {skipCovered: false})", async () => {
  const reports = await processCoverage(
    "./src/fixtures/test-istanbul-single.xml",
    {
      skipCovered: false,
    }
  );
  expect(reports[0].total).toBe(100);
  const files = reports[0].files;
  expect(files.length).toBe(1);

  expect(files[0].total).toBe(100);
  expect(files[0].branch).toBe(100);
  expect(files[0].line).toBe(100);
  expect(files[0].filename).toBe("src/action.js");
  expect(files[0].name).toBe("action.js");
});

test("processCoverage(test-python.xml, {skipCovered: false})", async () => {
  const reports = await processCoverage("./src/fixtures/test-python.xml", {
    skipCovered: false,
  });
  expect(reports[0].total).toBe(90);
  const files = reports[0].files;
  expect(files.length).toBe(1);

  expect(files[0].total).toBe(90);
  expect(files[0].branch).toBe(0);
  expect(files[0].line).toBe(90);
  expect(files[0].filename).toBe("source.py");
  expect(files[0].name).toBe("source.py");
});

test("processCoverage(glob-test-branch.xml, {skipCovered: false})", async () => {
  const reports = await processCoverage("./src/**/test-branch.xml");
  expect(reports.length).toBe(1);
  expect(reports[0].total).toBe(82.5);
  const files = reports[0].files;
  expect(files.length).toBe(4);

  expect(files[0].total).toBe(100);
  expect(files[0].branch).toBe(100);
  expect(files[0].line).toBe(100);
  expect(files[0].filename).toBe("Main.java");
  expect(files[0].name).toBe("Main");

  expect(files[1].total).toBe(87.5);
  expect(files[1].branch).toBe(83.33333333333334);
  expect(files[1].line).toBe(91.66666666666666);
  expect(files[1].filename).toBe("search/BinarySearch.java");
  expect(files[1].name).toBe("search.BinarySearch");

  expect(files[2].total).toBe(100);
  expect(files[2].branch).toBe(100);
  expect(files[2].line).toBe(100);
  expect(files[2].filename).toBe("search/ISortedArraySearch.java");
  expect(files[2].name).toBe("search.ISortedArraySearch");

  expect(files[3].total).toBe(69.04761904761904);
  expect(files[3].branch).toBe(66.66666666666666);
  expect(files[3].line).toBe(71.42857142857143);
  expect(files[3].filename).toBe("search/LinearSearch.java");
  expect(files[3].name).toBe("search.LinearSearch");
});

test("processCoverage(test-missing-lines.xml, {skipCovered: true})", async () => {
  const reports = await processCoverage("./src/**/test-missing-lines.xml");
  expect(reports.length).toBe(1);
  expect(reports[0].total).toBe(51.24999999999999);
  const files = reports[0].files;
  expect(files.length).toBe(8);

  expect(files[0].filename).toBe("all_lines_covered.py");
  expect(files[0].name).toBe("all_lines_covered.py");
  expect(files[0].total).toBe(100);
  expect(files[0].branch).toBe(0);
  expect(files[0].line).toBe(100);
  expect(files[0].missing).toBe("");

  expect(files[1].filename).toBe("miss_at_start.py");
  expect(files[1].total).toBe(80);
  expect(files[1].branch).toBe(0);
  expect(files[1].line).toBe(80);
  expect(files[1].missing).toStrictEqual([["1", "3"]]);

  expect(files[2].filename).toBe("miss_at_end.py");
  expect(files[2].total).toBe(80);
  expect(files[2].branch).toBe(0);
  expect(files[2].line).toBe(80);
  expect(files[2].missing).toStrictEqual([["9", "10"]]);

  expect(files[3].filename).toBe("single_line_gaps.py");
  expect(files[3].total).toBe(70);
  expect(files[3].branch).toBe(0);
  expect(files[3].line).toBe(70);
  expect(files[3].missing).toStrictEqual([
    ["3", "3"],
    ["5", "5"],
    ["9", "9"],
  ]);

  expect(files[4].filename).toBe("multi_line_gaps.py");
  expect(files[4].total).toBe(30);
  expect(files[4].branch).toBe(0);
  expect(files[4].line).toBe(30);
  expect(files[4].missing).toStrictEqual([
    ["4", "5"],
    ["7", "9"],
    ["15", "18"],
  ]);

  expect(files[5].filename).toBe("unsorted_lines.py");
  expect(files[5].total).toBe(50);
  expect(files[5].branch).toBe(0);
  expect(files[5].line).toBe(50);
  expect(files[5].missing).toStrictEqual([
    ["3", "4"],
    ["6", "6"],
    ["8", "9"],
  ]);

  expect(files[6].filename).toBe("no_lines.py");
  expect(files[6].total).toBe(0);
  expect(files[6].branch).toBe(0);
  expect(files[6].line).toBe(0);
  expect(files[6].missing).toStrictEqual([]);

  expect(files[7].filename).toBe("single_line.py");
  expect(files[7].total).toBe(0);
  expect(files[7].branch).toBe(0);
  expect(files[7].line).toBe(0);
  expect(files[7].missing).toStrictEqual([["4", "4"]]);
});

test("trimFolder", () => {
  expect(trimFolder("/a/b/c/file.xml", 7)).toBe("file.xml");
  expect(trimFolder("/a/b/c/file.xml", 3)).toBe("/b/c");
});

test("longestCommonPrefix", () => {
  expect(longestCommonPrefix(null)).toBe(0);
  expect(longestCommonPrefix([])).toBe(0);
});

test("processCoverage(test-prefix.xml, {prefixPath: 'somethingrandom/'})", async () => {
  const reports = await processCoverage("./src/fixtures/test-istanbul.xml", {
    prefixPath: "somethingrandom/",
    skipCovered: false,
  });

  const files = reports[0].files;
  expect(files[0].filename).toBe("somethingrandom/src/action.js");
});
