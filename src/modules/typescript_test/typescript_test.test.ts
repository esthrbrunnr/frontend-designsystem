describe('TypescriptTests', () => {
  let page;

  beforeAll(async () => {
    // eslint-disable-next-line no-underscore-dangle
    const url = `http://localhost:${(<any>global).__STATIC_PORT__}/modules/typescript_test/typescript_test.html`;

    // eslint-disable-next-line no-underscore-dangle
    page = await (<any>global).__BROWSER__.newPage();

    page.on('pageerror', console.log);

    await page.goto(url, {
      waitUntil: ['networkidle2'],
    });
  });

  afterEach(async () => {
    await page.reload();
  });

  afterAll(async () => {
    await page.close();
  });

  it('should load without error', async () => {
    const text = await page.evaluate(() => document.body.textContent);
    expect(text).toContain('TypescriptTest');
  });
});
