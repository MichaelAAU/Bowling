import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('Bowling App', () => {
  let page: AppPage;
  let originalTimeout: number;

  beforeEach(() => {
    page = new AppPage();
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
  });

  it('POST response should contain true = success', () => {

    page.navigateTo();

    for (var i = 0; i < 20; i++) {

      page.clickCalculateButtonAndWait();

      expect(page.getPOSTResponseText()).toMatch("true");

    }

  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
