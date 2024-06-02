import puppeteer, {
  Browser,
  ElementHandle,
  Locator,
  NodeFor,
  Page,
} from "puppeteer";

export async function createBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    slowMo: undefined, // might be useful for debugging
    defaultViewport: null, //so the viewport changes with window size
    userDataDir: "./user_data", // to persist login stuff
    args: [
      "--no-sandbox",
      "--disable-notifications",
      `--window-size=${1920},${1000}`,
      `--window-position=-500,500`,
    ], //chromium notifs get in the way when in non headless mode
  });

  return browser;
}

export async function createPage(browser: Browser) {
  const page = await browser.newPage();

  await page.setCacheEnabled(true);
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  ); //so we don't look like a bot
  // await page.setDefaultTimeout(0); //commmend and uncomment as needed

  return page;
}

export function getLocatorWithText(page: Page, text: string) {
  return page.locator(`::-p-text(${text})`);
}

export async function getParentWithText(
  page: ElementHandle | Page,
  text: string
) {
  const elementWithText = await page.waitForSelector(`::-p-text(${text})`);
  const elementWithTextParent = await elementWithText?.waitForSelector(
    "::-p-xpath(..)"
  );
  return elementWithTextParent;
}
