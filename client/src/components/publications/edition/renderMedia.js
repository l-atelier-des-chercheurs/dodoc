// Helper function to build style attribute from width/height using CSS variables
export function buildStyleAttribute(width, height) {
  if (!width && !height) return "";
  const vars = [];
  if (width) vars.push(`--media-width: ${width}`);
  if (height) vars.push(`--media-height: ${height}`);
  return vars.length > 0 ? ` style="${vars.join("; ")}"` : "";
}

// Helper function to detect media type from URL
function detectMediaTypeFromURL(url) {
  const lowerSrc = url.toLowerCase();
  if (
    lowerSrc.includes(".mp4") ||
    lowerSrc.includes(".webm") ||
    lowerSrc.includes(".ogg") ||
    lowerSrc.includes("video")
  ) {
    return "video";
  }
  if (
    lowerSrc.includes(".mp3") ||
    lowerSrc.includes(".wav") ||
    lowerSrc.includes(".ogg") ||
    lowerSrc.includes("audio")
  ) {
    return "audio";
  }
  if (lowerSrc.includes(".pdf")) {
    return "pdf";
  }
  return "image";
}

// Helper function to render QR code for book mode
function renderQRCode({ makeQREmbedForQR, alt, width, height, media }) {
  return makeQREmbedForQR({ alt, width, height, media });
}

// Helper function to render media HTML based on type
function renderMediaHTML({
  media_type,
  src,
  width,
  height,
  alt,
  has_caption,
  view_mode,
  makeQREmbedForQR,
  media,
  use_qr_code = false,
}) {
  const iframe_style_attr = buildStyleAttribute(width, height);
  const img_style_attr = buildStyleAttribute(width, height);
  const alt_attr = has_caption ? "" : alt ? ` alt="${alt}"` : "";

  // Use QR code if requested (only for local media in book mode)
  if (use_qr_code && media) {
    return renderQRCode({ makeQREmbedForQR, alt, width, height, media });
  }

  switch (media_type) {
    case "video":
      return `<video src="${src}" controls></video>`;
    case "audio":
      return `<audio src="${src}" controls></audio>`;
    case "pdf":
      // Ensure iframe has minimum dimensions for web mode
      let pdf_style = iframe_style_attr;
      if (view_mode === "html" && !width && !height) {
        // Default dimensions for web mode if none specified
        pdf_style = ' style="width: 100%; min-height: 400px;"';
      }
      return `<iframe src="${src}" type="application/pdf" frameborder="0"${
        pdf_style || ""
      }></iframe>`;
    case "image":
      return `<img src="${src}"${alt_attr}${img_style_attr} />`;
    case "embed":
      // External embed (e.g. PeerTube, YouTube) as iframe in HTML view
      const embed_style = iframe_style_attr || ' style="width: 100%; min-height: 400px;"';
      return `<iframe src="${src}" frameborder="0" allowfullscreen${embed_style}></iframe>`;
    case "text":
      return media?.$content || "";
    default:
      return "";
  }
}

/**
 * Renders media (image, video, audio) as HTML
 * @param {Object} params - Rendering parameters
 * @param {Object} params.media - Media object (optional, will be fetched if not provided)
 * @param {string} params.meta_src - Source path/URL of the media
 * @param {Array} params.source_medias - Array of source media objects
 * @param {string} params.alt - Alt text/caption
 * @param {string} params.width - Width (supports CSS units like "1cm", "100px", etc.)
 * @param {string} params.height - Height (supports CSS units)
 * @param {string} params.title - Title attribute (supports special formats like "=full-page")
 * @param {string} params.size - Size attribute (supports "full" or "full-cover")
 * @param {Object} params.context - Context object with helper functions
 * @param {string} params.context.view_mode - View mode ("book" or "html")
 * @param {Function} params.context.getMediaSrc - Function to get media from source
 * @param {Function} params.context.makeMediaFileURL - Function to create media file URLs
 * @param {Function} params.context.makeQREmbedForQR - Function to create QR code embeds
 * @param {Function} params.context.makeQREmbedForExternalURL - Function to create QR for external embed URLs
 * @param {string} params.tag - Shortcode tag (e.g. "embed", "pdf", "image")
 * @returns {Object} Object with `html` and `is_qr_code` properties
 */
export function renderMedia({
  media,
  meta_src,
  source_medias,
  alt,
  width,
  height,
  title,
  size,
  tag,
  context = {},
}) {
  const {
    view_mode = "html",
    getMediaSrc = () => null,
    makeMediaFileURL = ({ $path, $media_filename }) => `/${$media_filename}`,
    makeQREmbedForQR = () => "",
    makeQREmbedForExternalURL = () => "",
    getMissingMediaNoticeText = () => "Source media is missing",
  } = context;

  let media_html = "";
  let is_qr_code = false;
  let custom_classes = ["media"];

  // Check if we'll have a caption (to avoid duplicating in alt attribute)
  const has_caption = alt && alt.trim() !== "";

  // Handle size attribute (size: full or size: full-cover)
  if (view_mode === "book") {
    const isFullPage =
      size === "full" ||
      size === "full-page" ||
      size === "full-cover" ||
      size === "full-page-cover";
    const isFullCover = size === "full-cover" || size === "full-page-cover";

    if (isFullPage) {
      custom_classes.push("full-page");
      if (isFullCover) {
        custom_classes.push("full-page-cover");
      }
    }
  }

  // Handle special title attributes for styling and dimensions
  if (title?.startsWith("=")) {
    if (title.startsWith("=full-page")) {
      if (view_mode === "book") {
        custom_classes.push("full-page");
        if (title.startsWith("=full-page-cover")) {
          custom_classes.push("full-page-cover");
        }
      }
    } else {
      [width, height] = title
        .slice(1)
        .split("x")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }

  // Handle external URLs (http/https)
  if (meta_src && meta_src.startsWith("http")) {
    const media_type =
      tag === "embed" ? "embed" : detectMediaTypeFromURL(meta_src);
    custom_classes.push(`media-${media_type}`);

    // In book mode, external embed URLs show QR code (like PDF)
    const use_qr_for_external_embed =
      view_mode === "book" && tag === "embed" && makeQREmbedForExternalURL;

    if (use_qr_for_external_embed) {
      is_qr_code = true;
      custom_classes.push("_isqrcode");
      media_html = makeQREmbedForExternalURL({
        url: meta_src,
        alt,
        width,
        height,
      });
    } else {
      media_html = renderMediaHTML({
        media_type,
        src: meta_src,
        width,
        height,
        alt,
        has_caption,
        view_mode,
        makeQREmbedForQR,
        media: null, // External URLs don't have media object
        use_qr_code: false, // Other external URLs never use QR codes
      });
    }
  } else {
    // Handle local media
    if (!media) {
      media = getMediaSrc(meta_src, source_medias);
    }

    if (!media)
      return {
        html: `<figure class="${custom_classes.join(
          " "
        )}"><i>Media not found</i></figure>`,
        is_qr_code: false,
      };

    if (media?.$status === "missing")
      return {
        html: `<figure class="${custom_classes.join(
          " "
        )} media-missing"><i>${getMissingMediaNoticeText()}</i></figure>`,
        is_qr_code: false,
      };

    const src = makeMediaFileURL({
      $path: media.$path,
      $media_filename: media.$media_filename,
    });

    const media_type = media.$type;
    custom_classes.push(`media-${media_type}`);

    // Types that need QR code in book mode
    const qr_code_types = ["video", "audio", "pdf"];
    const use_qr_code =
      view_mode === "book" && qr_code_types.includes(media_type);

    if (use_qr_code) {
      is_qr_code = true;
      custom_classes.push("_isqrcode");
    }

    media_html = renderMediaHTML({
      media_type,
      src,
      width,
      height,
      alt,
      has_caption,
      view_mode,
      makeQREmbedForQR,
      media,
      use_qr_code,
    });
  }

  // Add caption if alt text is provided
  // Note: If alt is provided, we add it as figcaption and don't duplicate it in the alt attribute
  if (has_caption) {
    media_html += `\n<figcaption class="mediaCaption"><span>${alt}</span></figcaption>`;
  }

  // For external URLs, style is already on the img tag, so only add to figure for local media
  const style_attr =
    meta_src && meta_src.startsWith("http")
      ? ""
      : buildStyleAttribute(width, height);

  const html = `<figure class="${custom_classes.join(
    " "
  )}"${style_attr}>${media_html}</figure>`;

  return { html, is_qr_code };
}
