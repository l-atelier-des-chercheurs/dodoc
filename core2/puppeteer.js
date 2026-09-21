const puppeteer = require("puppeteer");

const utils = require("./utils");

const READY_FOR_EXPORT_EVENT = "READY_FOR_EXPORT";
// Screenshots / thumbs: short fallback when no ready signal.
const CAPTURE_READY_WAIT_MS = 8_000;
// PDF/PNG export: edition (paged.js) and heavy pubs need longer than 8s.
const EXPORT_READY_WAIT_MS = 30_000;
const READY_SETTLE_MS = 400;

const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--font-render-hinting=none",
  "--ignore-certificate-errors",
];

let shared_browser = null;
let browser_launch_promise = null;

function getLaunchOptions() {
  const options = {
    headless: true,
    ignoreHTTPSErrors: true,
    args: BROWSER_ARGS,
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  return options;
}

async function acquireBrowser() {
  if (shared_browser && shared_browser.isConnected()) {
    return shared_browser;
  }
  if (browser_launch_promise) {
    return browser_launch_promise;
  }
  browser_launch_promise = puppeteer.launch(getLaunchOptions()).then((browser) => {
    shared_browser = browser;
    browser_launch_promise = null;
    browser.on("disconnected", () => {
      shared_browser = null;
    });
    return browser;
  });
  return browser_launch_promise;
}

async function closeSharedBrowser() {
  if (browser_launch_promise) {
    await browser_launch_promise.catch(() => {});
  }
  if (shared_browser) {
    await shared_browser.close().catch(() => {});
    shared_browser = null;
  }
}

async function closePage(page) {
  if (page && !page.isClosed()) {
    await page.close().catch(() => {});
  }
}

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

async function configurePageForCapture(page) {
  await installReadyForExportListener(page);
}

async function configurePageForExport(page) {
  await installReadyForExportListener(page);
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType() === "websocket") {
      request.abort();
    } else {
      request.continue();
    }
  });
}

/**
 * Wait for the first ready event or timeout_ms, then READY_SETTLE_MS.
 */
async function waitForReadyForExportOrTimeout(
  page,
  timeout_ms = EXPORT_READY_WAIT_MS
) {
  const start = Date.now();
  try {
    await Promise.race([
      page.evaluate(() => {
        const p = window.__ready_for_export_promise;
        return p ? p : new Promise(() => {});
      }),
      new Promise((r) => setTimeout(r, timeout_ms)),
    ]);
  } catch (err) {
    /* navigation / context gone */
  }
  const elapsed = Date.now() - start;
  if (elapsed < timeout_ms) {
    dev.logverbose(`ready signal received after ${elapsed}ms`);
  } else {
    dev.logverbose(`ready signal timed out after ${timeout_ms}ms`);
  }
  await new Promise((r) => setTimeout(r, READY_SETTLE_MS));
}

module.exports = (function () {
  return {
    closeSharedBrowser,

    captureScreenshot: async ({ url, full_path_to_thumb }) => {
      let page;
      let page_timeout = setTimeout(async () => {
        await closePage(page);
        const err = new Error("Failed to capture screenshot");
        err.code = "timeout";
        throw err;
      }, 20_000);

      try {
        const browser = await acquireBrowser();
        page = await browser.newPage();
        const x_padding = 12;
        const y_padding = 8;
        const width = 800;
        const height = 800;

        await configurePageForCapture(page);

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
          `Waiting for ${READY_FOR_EXPORT_EVENT} or ${CAPTURE_READY_WAIT_MS}ms`
        );
        await waitForReadyForExportOrTimeout(page, CAPTURE_READY_WAIT_MS);

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
        await closePage(page);
      } catch (err) {
        clearTimeout(page_timeout);
        await closePage(page);
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

      let page;

      let page_timeout = setTimeout(async () => {
        dev.error(`page timeout for ${url}`);
        clearTimeout(page_timeout);
        await closePage(page);
        const err = new Error("Failed to capture media screenshot");
        err.code = "failed_to_capture_media_screenshot_page-timeout";
        throw err;
      }, 120_000);

      let stopTimeoutAndClosePage = async () => {
        if (page_timeout) {
          clearTimeout(page_timeout);
          page_timeout = null;
        }
        await closePage(page);
      };

      try {
        if (reportProgress) reportProgress(5);

        const browser = await acquireBrowser();
        page = await browser.newPage();

        if (reportProgress) reportProgress(10);

        await configurePageForExport(page);

        const device_scale_factor = recipe === "pdf" ? 1 : 2;
        await page.setViewport({
          width: bw_pagesize.width,
          height: bw_pagesize.height,
          deviceScaleFactor: device_scale_factor,
        });

        if (reportProgress) reportProgress(30);

        await page
          .goto(url, {
            // Keep networkidle0 for export: edition/paged.js needs assets
            // loaded before layout; "load" alone was too early.
            waitUntil: "networkidle0",
            timeout: 120_000,
          })
          .catch((err) => {
            throw err;
          });

        if (reportProgress) reportProgress(45);

        dev.logverbose(
          `Waiting for ${READY_FOR_EXPORT_EVENT} or ${EXPORT_READY_WAIT_MS}ms (export)`
        );
        await waitForReadyForExportOrTimeout(page, EXPORT_READY_WAIT_MS);

        await page.emulateMediaType("print");

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
        await stopTimeoutAndClosePage();

        return path_to_temp_file;
      } catch (err) {
        await stopTimeoutAndClosePage();
        throw err;
      }
    },
  };
})();
