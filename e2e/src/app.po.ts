import { browser, by, element } from 'protractor';

export class AppPage {

  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  clickCalculateButtonAndWait() {
    return element(by.id("appButton")).click().then(function() {browser.sleep(2000);}) as Promise<any>;
  }

  getPOSTResponseText() {
    return element(by.css("span[id='result']")).getText() as Promise<string>;
  }

}
