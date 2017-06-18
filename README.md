# Usage

## How to install
```npm install --save simple-protractor-screenshot```

Add this plugin to the protractor config file:
```js
exports.config = {
      plugins: [{
        package: 'jasmine2-protractor-utils',
        screenshotOnExpectSuccess: {Boolean}    (Default - false),
        screenshotOnExpectFailure: {Boolean}    (Default - false),
        screenshotOnSpecFailure: {Boolean}      (Default - false),
        screenshotPath: {String}                (Default - 'reports/screenshots'),
        clearFoldersBeforeTest: {Boolean}       (Default - false),
        debug: {Boolean}                        (Default - false)
      }]
    };
```