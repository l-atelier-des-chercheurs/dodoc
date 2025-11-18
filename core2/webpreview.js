module.exports = (function () {
  return {
    captureScreenshot: async ({ url, full_path_to_thumb }) => {
      dev.logfunction({ url, full_path_to_thumb });

      try {
        if (global.is_electron) {
          const electron = require("../electron/electron");
          await electron.captureScreenshot({ url, full_path_to_thumb });
        } else {
          const puppeteer = require("./puppeteer");
          await puppeteer.captureScreenshot({ url, full_path_to_thumb });
        }
      } catch (err) {
        dev.error(err.message);
        throw err;
      }
    },
    exportToPDFOrImage: async ({
      url,
      recipe,
      layout_mode,
      document_width,
      document_height,
      reportProgress,
      number_of_pages_to_export,
    }) => {
      dev.logfunction({
        url,
        recipe,
        layout_mode,
        number_of_pages_to_export,
        document_width,
        document_height,
        reportProgress,
      });

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

      if (global.is_electron) {
        const electron = require("../electron/electron");
        return await electron.exportToPDFOrImage({
          url,
          recipe,
          bw_pagesize,
          printToPDF_pagesize,
          number_of_pages_to_export,
          reportProgress,
        });
      } else {
        const puppeteer = require("./puppeteer");

        return await puppeteer.exportToPDFOrImage({
          url,
          recipe,
          bw_pagesize,
          printToPDF_pagesize,
          number_of_pages_to_export,
          reportProgress,
        });
      }
    },
  };
})();
