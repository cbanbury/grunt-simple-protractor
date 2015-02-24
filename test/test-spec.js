describe('test grunt protractor without server', function() {
  it('should open angularjs.org', function() {
    browser.get('https://www.angularjs.org/')
    expect(browser.getCurrentUrl()).toBe('https://www.angularjs.org/')
  });
});
