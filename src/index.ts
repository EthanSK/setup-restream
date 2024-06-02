import { Page } from "puppeteer";
import { createBrowser, createPage } from "./puppeteer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { delay } from "./utils";
(async () => {
  const browser = await createBrowser();
  const page = await createPage(browser);
  const argv = await yargs(hideBin(process.argv))
    .option("channels", {
      type: "string",
      alias: "c",
      description:
        "The channel name strings to match. Only needs to contain the given string to match.",
      default: ["REEEthan"],
      coerce: (arg) => {
        return arg.split(",");
      },
    })
    .option("set-yt-event", {
      type: "boolean",
      description:
        "If enabled, will try and select the first YouTube event for the given channel. Only works for YouTube.",
      default: false,
    }).argv;

  console.log(argv);
  await delay(2000);
  await page.goto("https://app.restream.io/channel", {
    waitUntil: "networkidle0",
  });
  await disableAllChanels(page);
  for (const channel of argv.channels) {
    await enableChannel(page, channel);
    if (argv["set-yt-event"]) await selectYouTubeLivestreamEvent(page, channel); //only works for youtube
  }
  console.log("Done!");
  browser.close();
})();

async function disableAllChanels(page: Page) {
  const selector = `li a`;
  await page.waitForSelector(selector);
  const channelNames = await page.$$(selector);

  console.log(`Found ${channelNames.length} channels to disable`);

  for (const channelName of channelNames) {
    const channelNameParent = await channelName
      ?.$("::-p-xpath(..)")
      .then((el) => el?.$("::-p-xpath(..)"));
    const channelActiveSwitch = await channelNameParent?.waitForSelector(
      "input[type=checkbox]"
    );
    const isChecked = await channelActiveSwitch?.evaluate(
      (el: HTMLInputElement) => el.checked
    );
    if (isChecked) {
      console.log("Channel is active, deactivating...");
      const switchParent = await channelActiveSwitch?.$("::-p-xpath(..)");
      switchParent?.click();
    }
  }
}

async function enableChannel(page: Page, channel: string) {
  const selector = `li a ::-p-text(${channel})`;
  await page.waitForSelector(selector);
  const channelNames = await page.$$(selector);

  console.log(`Found ${channelNames.length} channels to enable`);

  for (const channelName of channelNames) {
    const channelNameParent = await channelName
      ?.$("::-p-xpath(..)")
      .then((el) => el?.$("::-p-xpath(..)"));
    const channelActiveSwitch = await channelNameParent?.waitForSelector(
      "input[type=checkbox]"
    );
    const isChecked = await channelActiveSwitch?.evaluate(
      (el: HTMLInputElement) => el.checked
    );
    if (!isChecked) {
      console.log("Channel is not active, activating...");
      const switchParent = await channelActiveSwitch?.$("::-p-xpath(..)");
      switchParent?.click();
    }
  }
}

async function selectYouTubeLivestreamEvent(page: Page, channel: string) {
  const selector = `li a ::-p-text(${channel})`;
  await page.waitForSelector(selector);
  const channelNames = await page.$$(selector);
  console.log(`Found ${channelNames.length} for yt event to try`);
  for (const channelName of channelNames) {
    const channelItemContent = await channelName
      ?.$("::-p-xpath(..)")
      ?.then((el) => el?.$("::-p-xpath(..)"))
      ?.then((el) => el?.$("::-p-xpath(..)"))
      ?.then((el) => el?.$("::-p-xpath(..)"));
    const channelPlatformIcon = await channelItemContent?.$(
      "img[alt=youtube-icon]"
    );
    if (channelPlatformIcon) {
      console.log("Found YouTube channel, clicking...");
      const settingsButton = await channelItemContent?.$(
        "button[aria-label=Settings"
      );
      settingsButton?.click();
      await page.locator("::-p-text(Edit Settings)").click();
      await page.locator("#downshift-0-toggle-button").click();
      await page.locator("#downshift-0-item-1").click();
      await page.locator("button ::-p-text(Save)").click();
    }
  }
}
