const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://sd-github.ddev.site:8443/',
    setupNodeEvents(on, config) {
      // Register the "cypress-log-to-term" plugin.
      // https://github.com/bahmutov/cypress-log-to-term
      // IMPORTANT: pass the "on" callback argument
      require('cypress-log-to-term')(on)

      // Register the "cypress/grep" plugin.
      require('@cypress/grep/src/plugin')(config)
      return config
    },
  },
});
