const core = require("@actions/core");
const github = require("@actions/github");
const { action } = require("./src/action");

action(github.context.payload).catch((error) => {
  // Action threw an error. Fail the action with the error message.
  core.info(error.stack);
  core.setFailed(error.message);
});
