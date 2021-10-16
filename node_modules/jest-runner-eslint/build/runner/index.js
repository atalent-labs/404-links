"use strict";

const _require = require('create-jest-runner'),
      createJestRunner = _require.createJestRunner;

const configOverrides = require('../utils/configOverrides');

const runner = createJestRunner(require.resolve('./runESLint'), {
  getExtraOptions: () => ({
    fix: configOverrides.getFix()
  })
});
module.exports = runner;