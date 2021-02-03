const { escapeMarkdown } = require("./utils");

test("escapeMarkdown()", () => {
  const strings = [
    ["#1337!~", "\\#1337!\\~"],
    ["* and `stars`", "\\* and \\`stars\\`"],
    ["\\__init__.py", "\\\\\\_\\_init\\_\\_.py"],
  ];

  strings.forEach((string) => {
    expect(escapeMarkdown(string[0])).toBe(string[1]);
  });
});
