const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
const fs = require('fs');

exports.config = {
  runner: 'local',
  specs: ['./e2e/specs/**/*.e2e.js'],
  maxInstances: 1,
  baseUrl,
  logLevel: 'warn',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { ui: 'bdd', timeout: 90000 },
  services: ['chromedriver'],
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: process.env.E2E_HEADLESS === 'false'
        ? ['--window-size=1440,1100']
        : ['--headless=new', '--window-size=1440,1100', '--disable-gpu', '--no-sandbox'],
    },
  }],
  onPrepare: () => fs.mkdirSync('./e2e/reports', { recursive: true }),
  afterTest: async (_test, _context, { error }) => {
    if (error) await browser.saveScreenshot('./e2e/reports/failure.png');
  },
};
