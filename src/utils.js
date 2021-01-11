function escapeMarkdown(string) {
  return string.replace(/([*_`~#\\])/g, "\\$1");
}

module.exports = {
  escapeMarkdown
};
