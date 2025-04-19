// grabbed from https://github.com/furutsubaki/markdown-it-custom-short-codes

"use strict";
// Simpler pattern to capture tag, src, and the rest (attributes)
// It captures: 1:tag, 2:src, 3:attribute string
const markerPattern = /\(([-\w]+):\s*([^\s)]+)\s*(.*)\)/im;

const tags_list = ["image", "video", "audio"];

export default (md, o = {}) => {
  const cscRegexp = markerPattern; // Use the simplified pattern
  const getMediaSrc = o.getMediaSrc;
  const source_medias = o.source_medias;

  function csc(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    let currentLine = state.src.slice(pos, max);

    // check ( marker
    if (state.src.charCodeAt(pos) !== 0x28 /* ( */) return false;

    // Use the simplified regex to match the structure
    const match = cscRegexp.exec(currentLine);
    if (!match) {
      return false;
    }

    // Get the full matched text
    const fullMatch = match[0];

    // Parse tag and initial content (src)
    const tag = match[1].trim();
    const content = match[2].trim(); // This is the src

    if (!tags_list.includes(tag)) {
      return false;
    }

    if (silent) return true;

    // Parse attributes
    let attrs = {};
    attrs.src = content;

    // The rest of the string contains the attributes
    const attrString = match[3].trim();

    debugger;

    // Use a modified version of the user-provided regex (using \s instead of \h)
    const attrPattern = /([\w-]+):\s+(.*?(?=\s*(?:\b[\w-]+: |$)))/g;
    let attrMatch;

    while ((attrMatch = attrPattern.exec(attrString)) !== null) {
      const key = attrMatch[1].trim();
      // Handle potential empty values captured by .*?
      const value = attrMatch[2] ? attrMatch[2].trim() : "";
      if (key) {
        // Ensure key is not empty
        attrs[key] = value;
      }
    }

    // Advance the parser state
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

        let classes = ["media"];
        if (class_attr) {
          classes.push(class_attr);
        }

        // Create the image tag with all attributes
        const attrs_str = attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
        let imgTag = `<figure class="${classes.join(" ")}"${attrs_str}>`;

        if (token.tag === "image") {
          imgTag += `<img src="${src}" />`;
        } else if (token.tag === "video") {
          imgTag += `<video src="${src}" controls>`;
          imgTag += "</video>";
        } else if (token.tag === "audio") {
          imgTag += `<audio src="${src}" controls>`;
          imgTag += "</audio>";
        }

        // Add caption if it exists and is not empty
        const markdownCaption = token.attrs.caption;

        const caption =
          markdownCaption !== undefined && markdownCaption !== ""
            ? `\n<figcaption class="mediaCaption"><span>${md.renderInline(
                markdownCaption
              )}</span></figcaption>`
            : "";

        return imgTag + caption + "</figure>\n";
      default:
        return token.content + "\n";
    }
  };

  // insert csc rule
  md.block.ruler.before("paragraph", "csc", csc);
};
