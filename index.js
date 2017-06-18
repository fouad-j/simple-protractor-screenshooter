let fse = require('fs-extra');
let fs = require('fs');
let mkdirp = require('mkdirp');
let path = require('path');
const chalk = require('chalk');

let config = {
  screenshotOnExpectSuccess: false,
  screenshotOnExpectFailure: false,
  screenshotOnSpecFailure: false,
  clearFoldersBeforeTest: false,
  screenshotPath: './reports/screenshots',
  debug: false
};

const cleanDirectory = path => {
  if (config.clearFoldersBeforeTest) {
    try {
      fse.removeSync(path);
    } catch (err) {
      console.error(err);
    }
  }
};

const createDirectory = path => {
  try {
    const screenshotsPath = mkdirp.sync(path);
    if(config.debug) console.log(chalk.green.bold('Screenshots folder created :', screenshotsPath));
  } catch (err) {
    console.error(err);
  }
};

const initScreenshotsFolder = path => {
  if (config.clearFoldersBeforeTest) {
    cleanDirectory(path);
  }

  createDirectory(path);
};

const setup = function () {
  config = Object.assign({}, config, this.config);

  initScreenshotsFolder(config.screenshotPath)

  processScreenshotsWanted();
};

const processScreenshotsWanted = () => {
  // for access to jasmine
  global.browser.getProcessedConfig().then((globalConfig) => {

    if(config.screenshotOnExpectFailure) {
    const originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
    jasmine.Spec.prototype.addExpectationResult = function(passed, data, isError) {
      if (!passed) {
        if(config.debug) console.log(chalk.red.bold('ExpectFailure :', this.result.fullName));
        takeScreenshot(this.result.fullName);
      }
      return originalAddExpectationResult.apply(this, arguments);
    };
  }

  // TODO refactor with screenshotOnExpectSuccess
  if(config.screenshotOnSpecFailure && !config.screenshotOnExpectFailure) {
    jasmine.getEnv().addReporter((() => {
        return {
          specDone: result => {
          if (result.failedExpectations.length) {
      if(config.debug) console.log(chalk.red.bold('SpecFailure :', result.fullName));
      takeScreenshot(result.fullName);
    }
  }
  };
  })());
  }

  if(config.screenshotOnExpectSuccess) {
    jasmine.getEnv().addReporter((() => {
        return {
          specDone: result => {
          if (!result.failedExpectations.length) {
      if(config.debug) console.log(chalk.green.bold('ExpectSuccess :', result.fullName));
      takeScreenshot(result.fullName);
    }
  }
  };
  })());
  }

});
};

const takeScreenshot = fullNameSenaio => {
  global.browser.getProcessedConfig().then(config => {

    global.browser.takeScreenshot().then(
    png => saveScreenshot(config.capabilities.browserName, fullNameSenaio, png),
    err => console.log('Error while taking screenshot - ' + err.message));

});
};

const saveScreenshot = (browserName, specName, png) => {
  const fileName = `${browserName}-${specName}.png`.replace(/[\/\\]/g, ' ');

  const completPath = path.join(config.screenshotPath, fileName);

  let stream = fs.createWriteStream(completPath);
  stream.write(new Buffer(png, 'base64'));
  stream.end();
};

module.exports = {setup};