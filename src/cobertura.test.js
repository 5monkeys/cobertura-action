const { processCoverage } = require("./cobertura");

test("processCoverage(test-branch.xml, {skipCovered: false})", async () => {
  const report = await processCoverage("./src/fixtures/test-branch.xml");
  expect(report.total).toBe(82.5);
  const files = report.files;
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
  const report = await processCoverage("./src/fixtures/test-branch.xml", {
    skipCovered: true
  });
  expect(report.total).toBe(82.5);
  const files = report.files;
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
  const report = await processCoverage("./src/fixtures/test-branch.xml", {
    skipCovered: true
  });
  expect(report.total).toBe(82.5);
  const files = report.files;
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
  const report = await processCoverage("./src/fixtures/test-no-branch.xml", {
    skipCovered: true
  });
  expect(report.total).toBe(90);
  const files = report.files;
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
  const report = await processCoverage("./src/fixtures/test-istanbul.xml", {
    skipCovered: false
  });
  expect(report.total).toBe(100);
  const files = report.files;
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
  const report = await processCoverage(
    "./src/fixtures/test-istanbul-single.xml",
    {
      skipCovered: false
    }
  );
  expect(report.total).toBe(100);
  const files = report.files;
  expect(files.length).toBe(1);

  expect(files[0].total).toBe(100);
  expect(files[0].branch).toBe(100);
  expect(files[0].line).toBe(100);
  expect(files[0].filename).toBe("src/action.js");
  expect(files[0].name).toBe("action.js");
});

test("processCoverage(test-python.xml, {skipCovered: false})", async () => {
  const report = await processCoverage("./src/fixtures/test-python.xml", {
    skipCovered: false
  });
  expect(report.total).toBe(90);
  const files = report.files;
  expect(files.length).toBe(1);

  expect(files[0].total).toBe(90);
  expect(files[0].branch).toBe(0);
  expect(files[0].line).toBe(90);
  expect(files[0].filename).toBe("source.py");
  expect(files[0].name).toBe("source.py");
});

test("processCoverage(glob-test-branch.xml, {skipCovered: false})", async () => {
  const report = await processCoverage("./src/**/test-branch.xml");
  expect(report.total).toBe(82.5);
  const files = report.files;
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
