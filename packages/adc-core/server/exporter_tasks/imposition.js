const fs = require("fs-extra"),
  { PDFDocument } = require("@cantoo/pdf-lib");

const utils = require("../utils"),
  { getBookletOrder } = require("../../shared/booklet_imposition.mjs");

module.exports = (function () {
  const API = {
    // Saddle-stitch imposition: each output sheet side holds two source pages
    // side by side. signature_size = 0 puts all pages in a single signature.
    // Returns the path to the imposed PDF and the page count of the source.
    async imposeBooklet({ source, signature_size = 0 }) {
      const source_pdf = await PDFDocument.load(await fs.readFile(source));
      const page_count = source_pdf.getPageCount();
      if (page_count === 0) throw new Error(`no_pages_to_impose`);

      const { width, height } = source_pdf.getPage(0).getSize();

      const output_pdf = await PDFDocument.create();
      const pages = await output_pdf.embedPdf(
        source_pdf,
        source_pdf.getPageIndices()
      );

      const sides = getBookletOrder({ page_count, signature_size });
      for (const [left, right] of sides) {
        const sheet = output_pdf.addPage([width * 2, height]);
        if (pages[left]) sheet.drawPage(pages[left], { x: 0, y: 0 });
        if (pages[right]) sheet.drawPage(pages[right], { x: width, y: 0 });
      }

      const destination = await utils.createUniqueFilenameInCache("pdf");
      await fs.writeFile(destination, await output_pdf.save());
      return { path: destination, page_count };
    },
  };

  return API;
})();
