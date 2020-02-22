const fs = require("fs").promises;
const xml2js = require("xml2js");
const util = require("util");
const parseString = util.promisify(xml2js.parseString);

async function processCoverage(path, options) {
  options = options || { skipCovered: false };
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
        name: klass["name"]
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

module.exports = {
  processCoverage
};
