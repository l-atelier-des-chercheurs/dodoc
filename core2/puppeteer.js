const puppeteer = require("puppeteer");

const utils = require("./utils");

const READY_FOR_EXPORT_EVENT = "READY_FOR_EXPORT";
const READY_WAIT_MS = 15_000;
const READY_SETTLE_MS = 400;

/**
 * Register before navigation: listen for READY_FOR_EXPORT with detail.ready === true.
 */
async function installReadyForExportListener(page) {
  await page.evaluateOnNewDocument((event_name) => {
    window.__ready_for_export_promise = new Promise((resolve) => {
      window.addEventListener(
        event_name,
        function onReadyForExport(e) {
          if (e.detail && e.detail.ready === true) {
            window.removeEventListener(event_name, onReadyForExport);
            resolve();
          }
        }
      );
    });
  }, READY_FOR_EXPORT_EVENT);
}

/**
 * Wait for the first ready event or READY_WAIT_MS, then READY_SETTLE_MS.
 */
async function waitForReadyForExportOrTimeout(page) {
  const start = Date.now();
  try {
    await Promise.race([
      page.evaluate(() => {
        const p = window.__ready_for_export_promise;
        return p ? p : new Promise(() => {});
      }),
      new Promise((r) => setTimeout(r, READY_WAIT_MS)),
    ]);
  } catch (err) {
    /* navigation / context gone */
  }
  const elapsed = Date.now() - start;
  if (elapsed < READY_WAIT_MS) {
    console.log("ready signal received after " + elapsed + "ms");
  }
  await new Promise((r) => setTimeout(r, READY_SETTLE_MS));
}

module.exports = (function () {
  return {
    captureScreenshot: async ({ url, full_path_to_thumb }) => {
      let browser;

      let page_timeout = setTimeout(async () => {
        if (browser) await browser.close();
        const err = new Error("Failed to capture screenshot");
        err.code = "timeout";
        throw err;
      }, 20_000);

      try {
        browser = await puppeteer.launch({
          headless: true,
          ignoreHTTPSErrors: true,
          args: [
            "--no-sandbox",
            "--font-render-hinting=none",
            "--ignore-certificate-errors",
          ],
        });

        const page = await browser.newPage();
        const x_padding = 12;
        const y_padding = 8;
        const width = 800;
        const height = 800;

        await installReadyForExportListener(page);

        await page.setUserAgent("facebookexternalhit/1.1");
        await page.setViewport({
          width: width + x_padding * 2,
          height: height + y_padding,
          deviceScaleFactor: 2,
        });

        dev.logverbose(`Navigating to ${url}`);

        await page
          .goto(url, {
            waitUntil: "load",
            timeout: 60_000,
          })
          .catch((err) => {
            throw err;
          });

        dev.logverbose(
          `Waiting for ${READY_FOR_EXPORT_EVENT} or ${READY_WAIT_MS}ms`
        );
        await waitForReadyForExportOrTimeout(page);

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
      } catch (err) {
        clearTimeout(page_timeout);
        if (browser) await browser.close();
        throw err;
      }
    },
    exportToPDFOrImage: async ({
      url,
      recipe,
      bw_pagesize,
      number_of_pages_to_export,
      printToPDF_pagesize,
      reportProgress,
    }) => {
      if (reportProgress) reportProgress(0);

      let browser;

      let page_timeout = setTimeout(async () => {
        dev.error(`page timeout for ${url}`);
        clearTimeout(page_timeout);
        if (browser) await browser.close();
        const err = new Error("Failed to capture media screenshot");
        err.code = "failed_to_capture_media_screenshot_page-timeout";
        throw err;
      }, 120_000);

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
          args: [
            "--no-sandbox",
            "--font-render-hinting=none",
            "--ignore-certificate-errors",
          ],
        });

        if (reportProgress) reportProgress(10);

        const page = await browser.newPage();

        await installReadyForExportListener(page);

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

        dev.logverbose(
          `Waiting for ${READY_FOR_EXPORT_EVENT} or ${READY_WAIT_MS}ms (export)`
        );
        await waitForReadyForExportOrTimeout(page);

        page.emulateMediaType("print");

        if (reportProgress) reportProgress(70);

        let path_to_temp_file = "";

        if (recipe === "pdf") {
          path_to_temp_file = await utils.createUniqueFilenameInCache("pdf");

          const options = {
            path: path_to_temp_file,
            printBackground: true,
            width: `${printToPDF_pagesize.width}mm`,
            height: `${printToPDF_pagesize.height}mm`,
            margin: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          };
          if (number_of_pages_to_export) {
            options.pageRanges = `1-${number_of_pages_to_export}`;
          }
          await page.pdf(options);
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
