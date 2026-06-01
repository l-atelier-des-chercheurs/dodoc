// Test helper that creates a renderMedia function using the actual implementation
// This allows us to use the real rendering logic in tests
import { renderMedia as renderMediaFunction } from "../renderMedia.js";

export function createRenderMediaHelper(options = {}) {
  const {
    view_mode = "html",
    getMediaSrc = () => null,
    makeMediaFileURL = ({ $path, $media_filename }) => `/${$media_filename}`,
    makeQREmbedForQR = () => "",
  } = options;

  return function renderMedia({
    media,
    meta_src,
    source_medias,
    alt,
    width,
    height,
    title,
  }) {
    return renderMediaFunction({
      media,
      meta_src,
      source_medias,
      alt,
      width,
      height,
      title,
      context: {
        view_mode,
        getMediaSrc,
        makeMediaFileURL,
        makeQREmbedForQR,
      },
    });
  };
}
