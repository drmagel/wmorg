exports.config = {
  /**
   * Use `seleniumAddress` for faster startup; run `webdriver-manager start` to launch the Selenium server.
   * Use `seleniumPort` to let Protractor manage its own Selenium server instance (using the server JAR in its default location).
   */
  seleniumAddress: 'http://localhost:4444/wd/hub',
  // seleniumPort: 4444,

  /**
   * Path to your E2E test files, relative to the location of this configuration file.
   * We're pointing to the directory where our CoffeeScript output goes.
   */
  specs: [
    'tests/*.spec.js',
  ],

  /**
   * Properties passed to Selenium -- see https://code.google.com/p/selenium/wiki/DesiredCapabilities for more info.
   */

  /**
   * Chrome Browser
   *
  capabilities: {
    'browserName': 'chrome'
  },
  */

  capabilities: {
    'browserName': 'phantomjs',

 /* 
 * Can be used to specify the phantomjs binary path.
 * This can generally be ommitted if you installed phantomjs globally.
 */
 //   'phantomjs.binary.path': require('phantomjs').path,

 /*
 * Command line args to pass to ghostdriver, phantomjs's browser driver.
 * See https://github.com/detro/ghostdriver#faq
 */
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
  },

  /**
   * This should point to your running app instance, for relative path resolution in tests.
   */
  baseUrl: 'http://localhost:3000'
};
