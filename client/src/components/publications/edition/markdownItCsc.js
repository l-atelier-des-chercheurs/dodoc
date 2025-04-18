// grabbed from https://github.com/furutsubaki/markdown-it-custom-short-codes

"use strict";
// Match the main tag and content, followed by any number of attributes
const markerPattern =
  /\(([\w-]+):\s+([^\s]+)(?:\s+([\w-]+):\s+([^)\s](?:.*?(?=\s+[\w-]+:|$)|[^)]*)))*\)/im;

const tags_list = ["image", "video", "audio"];

export default (md, o = {}) => {
  const cscRegexp = markerPattern;
  const getMediaSrc = o.getMediaSrc;
  const source_medias = o.source_medias;

  function csc(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];

    let marker = state.src.charCodeAt(pos);

    // check ( marker
    if (marker !== 0x28 /* ( */) return false;

    // Get the full match text
    const fullText = state.src.substr(pos);

    // First check if it matches our basic pattern
    let match = cscRegexp.exec(fullText);
    if (!match) {
      return false;
    }

    // Get the full matched text
    const fullMatch = match[0];

    // Parse tag and initial content
    const tag = match[1].trim();
    const content = match[2].trim();

    if (!tags_list.includes(tag)) {
      return false;
    }

    if (silent) return true;

    // Parse attributes
    let attrs = {};
    attrs.src = content;

    // Find all attribute pairs using regex - handling multi-word values and empty values properly
    // Updated regex to properly handle empty values and not include closing parenthesis
    const attrPattern =
      /([\w-]+):\s+((?:[^)\s][^)]*?(?=\s+[\w-]+:|$)|[^)]*?)(?=\s+[\w-]+:|$|\)))/g;
    const attrMatches = fullMatch.matchAll(attrPattern);

    for (const match of attrMatches) {
      const [_, key, value] = match;
      if (key !== "image" && key !== "video" && key !== "audio") {
        // Skip the main image tag
        attrs[key] = value.trim();
      }
    }

    state.line = startLine + 1;

    // set token
    let token = state.push("csc", tag, 0);
    token.map = [startLine, state.line];
    token.markup = fullMatch;
    token.attrs = attrs;
    token.content = content;

    return true;
  }

  // set render csc
  md.renderer.rules.csc = function (tokens, index, type) {
    const token = tokens[index];
    if (!token.content) return "";

    // Handle different types of shortcodes
    switch (token.tag) {
      case "image":
      case "video":
      case "audio":
        // Use getMediaSrc if available, otherwise fallback to normal behavior
        let media = null;
        if (getMediaSrc && !token.attrs.src.startsWith("http")) {
          media = getMediaSrc(token.attrs.src, source_medias);
        }

        const attrs = [];

        let src = "";
        if (media) {
          src = media.src;
        } else if (token.attrs.src.startsWith("http")) {
          src = token.attrs.src;
        }

        let class_attr = "";
        if (token.attrs.class) {
          class_attr = `${token.attrs.class}`;
        }

        // Add all other attributes except caption
        for (const [key, value] of Object.entries(token.attrs)) {
          if (key !== "src" && key !== "caption" && key !== "class") {
            attrs.push(`${key}="${value}"`);
          }
        }

        // Create the image tag with all attributes
        let imgTag = `<figure class="media${
          class_attr ? ` ${class_attr}` : ""
        }">`;

        const attrs_str = attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
        if (token.tag === "image") {
          imgTag += `<img src="${src}"${attrs_str} />`;
        } else if (token.tag === "video") {
          imgTag += `<video src="${src}"${attrs_str} controls>`;
          imgTag += "</video>";
        } else if (token.tag === "audio") {
          imgTag += `<audio src="${src}"${attrs_str} controls>`;
          imgTag += "</audio>";
        }

        // Add caption if it exists and is not empty
        const markdownCaption = token.attrs.caption;

        const caption =
          markdownCaption !== undefined && markdownCaption !== ""
            ? `\n<figcaption class="mediaCaption"><span>${markdownCaption}</span></figcaption>`
            : "";

        return imgTag + caption + "</figure>\n";
      default:
        return token.content + "\n";
    }
  };

  // insert csc rule
  md.block.ruler.before("paragraph", "csc", csc);
};
