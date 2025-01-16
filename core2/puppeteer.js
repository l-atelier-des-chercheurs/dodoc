const puppeteer = require("puppeteer");

const utils = require("./utils");

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
    exportToPDFOrImage: async ({
      url,
      recipe,
      layout_mode,
      document_width,
      document_height,
      reportProgress,
    }) => {
      if (reportProgress) reportProgress(0);

      // print to pdf with size, try to match pagesize with pixels
      const reduction_factor = layout_mode === "print" ? 1 : 3.7952;
      const magnify_factor = layout_mode === "print" ? 3.7952 : 1;

      const bw_pagesize = {
        width: Math.floor(document_width * magnify_factor),
        height: Math.floor(document_height * magnify_factor) + 0,
      };

      const printToPDF_pagesize = {
        width: document_width / reduction_factor,
        height: document_height / reduction_factor,
      };

      let browser;

      let page_timeout = setTimeout(async () => {
        dev.error(`page timeout for ${url}`);
        clearTimeout(page_timeout);
        if (browser) await browser.close();
        const err = new Error("Failed to capture media screenshot");
        err.code = "failed_to_capture_media_screenshot_page-timeout";
        throw err;
      }, 30_000);
      let stopTimeoutAndCloseBrowser = async () => {
        if (page_timeout) {
          clearTimeout(page_timeout);
          page_timeout = null;
        }
        if (browser) {
          dev.logverbose(`closing browser`);
          await browser.close();
        }
      };

      try {
        if (reportProgress) reportProgress(5);

        browser = await puppeteer.launch({
          headless: true,
          ignoreHTTPSErrors: true,
          args: ["--no-sandbox", "--font-render-hinting=none"],
        });

        if (reportProgress) reportProgress(10);

        const page = await browser.newPage();

        // Set screen size
        await page.setViewport({
          width: bw_pagesize.width,
          height: bw_pagesize.height,
          deviceScaleFactor: 2,
        });

        if (reportProgress) reportProgress(30);

        await page
          .goto(url, {
            waitUntil: "networkidle0",
          })
          .catch((err) => {
            throw err;
          });

        if (reportProgress) reportProgress(45);

        page.emulateMediaType("print");

        await new Promise((r) => setTimeout(r, 3000));

        if (reportProgress) reportProgress(70);

        let path_to_temp_file = "";

        if (recipe === "pdf") {
          path_to_temp_file = await utils.createUniqueFilenameInCache("pdf");
          await page.pdf({
            path: path_to_temp_file,
            printBackground: true,
            width: `${printToPDF_pagesize.width}mm`,
            height: `${printToPDF_pagesize.height}mm`,
          });
        } else if (recipe === "png") {
          path_to_temp_file = await utils.createUniqueFilenameInCache("png");
          await page.screenshot({
            path: path_to_temp_file,
            clip: {
              x: 0,
              y: 0,
              width: Math.floor(bw_pagesize.width),
              height: Math.floor(bw_pagesize.height),
            },
          });
          // path_to_temp_file = await this._saveImage({
          //   data,
          //   width: bw_pagesize.width,
          //   height: bw_pagesize.height,
          // });
        }

        if (reportProgress) reportProgress(100);
        await stopTimeoutAndCloseBrowser();

        return path_to_temp_file;
      } catch (err) {
        await stopTimeoutAndCloseBrowser();
        throw err;
      }
    },
  };
})();
