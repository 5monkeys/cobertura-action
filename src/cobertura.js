const fs = require("fs").promises;
const xml2js = require("xml2js");
const util = require("util");
const glob = require("glob-promise");
const parseString = util.promisify(xml2js.parseString);

async function processCoverage(path, options) {
  options = options || { skipCovered: false };

  if (glob.hasMagic(path)) {
    const paths = await glob(path);
    path = paths[0];
  }

  const xml = await fs.readFile(path, "utf-8");
  const { coverage } = await parseString(xml, {
    explicitArray: false,
    mergeAttrs: true
  });
  const { packages } = coverage;
  const classes = processPackages(packages);
  const files = classes
    .filter(Boolean)
    .map(klass => {
      return {
        ...calculateRates(klass),
        filename: klass["filename"],
        name: klass["name"],
        missing: missingLines(klass)
      };
    })
    .filter(file => options.skipCovered === false || file.total < 100);
  return {
    ...calculateRates(coverage),
    files
  };
}

function processPackages(packages) {
  if (packages.package instanceof Array) {
    return packages.package.map(p => processPackage(p)).flat();
  } else if (packages.package) {
    return processPackage(packages.package);
  } else {
    return processPackage(packages);
  }
}

function processPackage(packageObj) {
  if (packageObj.classes && packageObj.classes.class instanceof Array) {
    return packageObj.classes.class;
  } else if (packageObj.classes && packageObj.classes.class) {
    return [packageObj.classes.class];
  } else if (packageObj.class && packageObj.class instanceof Array) {
    return packageObj.class;
  } else {
    return [packageObj.class];
  }
}

function calculateRates(element) {
  const line = parseFloat(element["line-rate"]) * 100;
  const branch = parseFloat(element["branch-rate"]) * 100;
  const total = line && branch ? (line + branch) / 2 : line;
  return {
    total,
    line,
    branch
  };
}

function getLines(klass) {
  if (klass.lines && klass.lines.line instanceof Array) {
    return klass.lines.line;
  } else if (klass.lines && klass.lines.line) {
    return [klass.lines.line];
  } else {
    return [];
  }
}

function missingLines(klass) {
  // Bail if line-rate says fully covered
  if (parseFloat(klass["line-rate"]) >= 1.0) return "";

  const lines = getLines(klass).sort(
    (a, b) => parseInt(a.number) - parseInt(b.number)
  );
  const statements = lines.map(line => line.number);
  const misses = lines
    .filter(line => parseInt(line.hits) < 1)
    .map(line => line.number);
  return formatLines(statements, misses);
}

function formatLines(statements, lines) {
  /*
   * Detect sequences, with gaps according to 'statements',
   * in 'lines' and compress them in to a range format.
   *
   * Example:
   *
   * statements = [1,2,3,4,5,10,11,12,13,14]
   * lines =      [1,2,    5,10,11,   13,14]
   * Returns: "1-2, 5-11, 13-14"
   */
  const ranges = [];
  let start = null;
  let linesCursor = 0;
  for (const statement of statements) {
    if (linesCursor >= lines.length) break;

    if (statement === lines[linesCursor]) {
      // (Consecutive) element from 'statements' matches
      // element from 'lines' at 'linesCursor'
      linesCursor += 1;
      if (start === null) start = statement;
      end = statement;
    } else if (start !== null) {
      // Consecutive elements are broken, an element from
      // 'statements' is missing from 'lines'
      ranges.push([start, end]);
      start = null;
    }
  }
  // (Eventually) close range running last iteration
  if (start !== null) ranges.push([start, end]);

  // Convert ranges to a comma separated string
  return ranges
    .map(range => {
      const [start, end] = range;
      return start === end ? start : start + "-" + end;
    })
    .join(", ");
}

module.exports = {
  processCoverage
};
