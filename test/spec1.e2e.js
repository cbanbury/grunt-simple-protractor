describe('test grunt protractor', function() {
  it('should open an angular page and demonstrate 2-way binding', function() {
    browser.get('http://127.0.0.1:8080/test/index.html')

    var foo = element(by.model('foo'))
    foo.sendKeys('qux')

    var bar = element(by.id('baz'))
    expect(bar.getInnerHtml()).toEqual('barqux')
  });
});
