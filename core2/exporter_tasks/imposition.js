const fs = require("fs-extra"),
  { PDFDocument } = require("@cantoo/pdf-lib");

const utils = require("../utils");

module.exports = (function () {
  const API = {
    // Saddle-stitch imposition: each output sheet side holds two source pages
    // side by side. signature_size = 0 puts all pages in a single signature.
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

      const sides = API.getBookletOrder({ page_count, signature_size });
      for (const [left, right] of sides) {
        const sheet = output_pdf.addPage([width * 2, height]);
        if (pages[left]) sheet.drawPage(pages[left], { x: 0, y: 0 });
        if (pages[right]) sheet.drawPage(pages[right], { x: width, y: 0 });
      }

      const destination = await utils.createUniqueFilenameInCache("pdf");
      await fs.writeFile(destination, await output_pdf.save());
      return destination;
    },

    // returns a list of [left, right] page indexes, one per sheet side (front
    // then back), indexes >= page_count are blank pages
    getBookletOrder({ page_count, signature_size = 0 }) {
      const round_to_four = (n) => Math.ceil(n / 4) * 4;

      const signature_length =
        signature_size > 0 ? round_to_four(signature_size) : round_to_four(page_count);

      const sides = [];
      for (let offset = 0; offset < page_count; offset += signature_length) {
        const n = round_to_four(
          Math.min(signature_length, page_count - offset)
        );
        for (let k = 0; k < n / 4; k++) {
          sides.push([offset + n - 1 - 2 * k, offset + 2 * k]);
          sides.push([offset + 2 * k + 1, offset + n - 2 - 2 * k]);
        }
      }
      return sides;
    },
  };

  return API;
})();
