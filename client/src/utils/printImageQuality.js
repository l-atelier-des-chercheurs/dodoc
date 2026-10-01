// Image quality for PDF exports: images start as their largest thumb (light
// to lay out), then once the layout is done each one is switched to the
// smallest thumb, or the source file, that covers its printed size.

export const IMAGE_QUALITY_DPI = {
  high: 300,
  medium: 150,
  draft: 48,
};

const CSS_PX_PER_INCH = 96;

export function getPrintDPI(image_quality) {
  return IMAGE_QUALITY_DPI[image_quality] || false;
}

// Long side, in source pixels, an image needs to be printed at `dpi` when
// its box is `box_width` × `box_height` CSS px and it keeps the
// `natural_width` / `natural_height` ratio.
export function requiredLongSideForPrint({
  box_width,
  box_height,
  natural_width,
  natural_height,
  object_fit,
  dpi,
}) {
  if (!box_width || !box_height || !natural_width || !natural_height) return 0;

  const scale_x = box_width / natural_width;
  const scale_y = box_height / natural_height;
  // contain shows the whole image inside the box, other modes fill it
  // (cover crops, fill stretches): the larger scale is the one to honor
  const scale = ["contain", "scale-down"].includes(object_fit)
    ? Math.min(scale_x, scale_y)
    : Math.max(scale_x, scale_y);

  const displayed_long_side =
    Math.max(natural_width, natural_height) * scale;
  return Math.ceil((displayed_long_side / CSS_PX_PER_INCH) * dpi);
}

// `sources` is sorted by long side, the source file last: smallest one that
// is large enough, or the source file when none is.
export function pickSourceForPrint(sources, required) {
  return (
    sources.find(({ size }) => size >= required) || sources[sources.length - 1]
  );
}

function escapeAttribute(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// src (and data-print-sources for upgradeImagesForPrint) attributes of an
// <img>, from makeImageSourcesForPrint
export function imageSourceAttributes({ src, sources }) {
  let attrs = `src="${src}"`;
  if (sources)
    attrs += ` data-print-sources="${escapeAttribute(
      JSON.stringify(sources)
    )}"`;
  return attrs;
}

function waitForImage(img) {
  return new Promise((resolve) => {
    if (img.complete) return resolve();
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });
}

export async function upgradeImagesForPrint(root, dpi) {
  if (!root || !dpi) return;

  const images = [...root.querySelectorAll("img[data-print-sources]")];
  await Promise.all(images.map(waitForImage));

  const switched = images.filter((img) => {
    // hidden pages (export of a page range) are not printed
    if (!img.offsetWidth || !img.offsetHeight) return false;

    let sources;
    try {
      sources = JSON.parse(img.dataset.printSources);
    } catch (err) {
      return false;
    }
    if (!sources?.length) return false;

    const required = requiredLongSideForPrint({
      box_width: img.offsetWidth,
      box_height: img.offsetHeight,
      natural_width: img.naturalWidth,
      natural_height: img.naturalHeight,
      object_fit: getComputedStyle(img).objectFit,
      dpi,
    });
    const { url } = pickSourceForPrint(sources, required);
    if (url === img.getAttribute("src")) return false;

    img.src = url;
    return true;
  });

  await Promise.all(switched.map(waitForImage));
}
