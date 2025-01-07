const puppeteer = require("puppeteer");

module.exports = (function () {
  return {
    captureScreenshot: async ({ url, full_path_to_thumb }) => {
      let browser;

      let page_timeout = setTimeout(async () => {
        if (browser) await browser.close();
        try {
          const err = new Error("Failed to capture media screenshot");
          err.code = "failed_to_capture_media_screenshot_page-timeout";
          throw err;
        } catch (e) {
          dev.error(`page timeout for ${url}`);
        }
      }, 10_000);

      browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: ["--no-sandbox", "--font-render-hinting=none"],
      });

      const page = await browser.newPage();
      const x_padding = 12;
      const y_padding = 8;
      const width = 800;
      const height = 800;

      await page.setUserAgent("facebookexternalhit/1.1");
      await page.setViewport({
        width: width + x_padding * 2,
        height: height + y_padding,
        deviceScaleFactor: 2,
      });

      dev.logverbose(`Navigating to ${url}`);

      await page.goto(url).catch((err) => {
        throw err;
      });

      dev.logverbose(`Waiting for page to load`);

      await new Promise((resolve) => setTimeout(resolve, 3_000));

      dev.logverbose(`Taking screenshot`);
      await page.screenshot({
        path: full_path_to_thumb,
        clip: {
          x: x_padding,
          y: y_padding,
          width: width,
          height: height,
        },
      });
      dev.logverbose(`Screenshot taken`);
      await new Promise((resolve) => setTimeout(resolve, 200));
      clearTimeout(page_timeout);
      if (browser) await browser.close();
    },
  };
})();
