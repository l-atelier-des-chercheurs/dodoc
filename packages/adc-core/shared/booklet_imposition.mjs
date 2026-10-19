/**
 * Saddle-stitch booklet imposition, shared by core2 (PDF imposition) and the
 * client (export preview schema).
 * ESM so Vite can serve it as-is; core2 loads it with require() (Node ≥ 22.12).
 */

const roundToFour = (n) => Math.ceil(n / 4) * 4;

// Splits page_count pages into signatures, each padded to a multiple of 4
// signature_size = 0 puts all pages in a single signature
export function getBookletSignatures({ page_count, signature_size = 0 }) {
  const signature_length =
    signature_size > 0 ? roundToFour(signature_size) : roundToFour(page_count);

  const signatures = [];
  for (let offset = 0; offset < page_count; offset += signature_length) {
    const length = roundToFour(Math.min(signature_length, page_count - offset));
    const sheets = [];
    for (let k = 0; k < length / 4; k++) {
      sheets.push({
        front: [offset + length - 1 - 2 * k, offset + 2 * k],
        back: [offset + 2 * k + 1, offset + length - 2 - 2 * k],
      });
    }
    signatures.push({ offset, length, sheets });
  }
  return signatures;
}

// returns a list of [left, right] page indexes, one per sheet side (front
// then back), indexes >= page_count are blank pages
export function getBookletOrder({ page_count, signature_size = 0 }) {
  return getBookletSignatures({ page_count, signature_size }).flatMap(
    ({ sheets }) => sheets.flatMap(({ front, back }) => [front, back])
  );
}
