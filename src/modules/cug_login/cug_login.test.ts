jest.setTimeout(30000); // eslint-disable-line no-magic-numbers
describe('LoginForm', () => {
  let page: any;

  beforeAll(async () => {
    // eslint-disable-next-line no-underscore-dangle
    const url = `http://localhost:${(<any>global).__STATIC_PORT__}/modules/login_form/login_form.html`;

    // eslint-disable-next-line no-underscore-dangle
    page = await (<any>global).__BROWSER__.newPage();
    // eslint-disable-next-line
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

  it('should load without error', async () => true);
});
