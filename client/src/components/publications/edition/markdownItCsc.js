// grabbed from https://github.com/furutsubaki/markdown-it-custom-short-codes

"use strict";
// Pattern to capture tag, src, and the rest (attributes)
// It captures: 1:tag, 2:src, 3:attribute string
const markerPattern = /\(([-\w]+):\s*([^\s)]+)\s*(.*?)\)/;

const tags_list = ["image", "video", "audio"];

export default (md, o = {}) => {
  const getMediaSrc = o.getMediaSrc;
  const source_medias = o.source_medias;

  function csc(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    let lineText = state.src.slice(pos, max);
    let foundShortcode = false;

    // Process all shortcodes on the current line
    while (pos < max) {
      // Find opening parenthesis
      const openParenPos = lineText.indexOf("(");
      if (openParenPos === -1) break;

      // Adjust position to the opening parenthesis
      pos += openParenPos;

      // Extract text from current position to end of line
      const remainingText = state.src.slice(pos, max);

      // Check for valid shortcode pattern
      const match = markerPattern.exec(remainingText);
      if (!match) {
        pos++;
        lineText = state.src.slice(pos, max);
        continue;
      }

      // Get the full matched text including parentheses
      const fullMatch = match[0];

      // Parse tag and initial content (src)
      const tag = match[1].trim();
      const content = match[2].trim(); // This is the src

      if (!tags_list.includes(tag)) {
        pos++;
        lineText = state.src.slice(pos, max);
        continue;
      }

      if (silent) return true;

      // Parse attributes
      let attrs = {};
      attrs.src = content;

      // The rest of the string contains the attributes
      const attrString = match[3].trim();

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

      // Set token
      let token = state.push("csc", tag, 0);
      token.map = [startLine, startLine + 1];
      token.markup = fullMatch;
      token.attrs = attrs;
      token.content = content;

      // Move position forward by the length of the matched shortcode
      pos += fullMatch.length;
      lineText = state.src.slice(pos, max);
      foundShortcode = true;
    }

    if (foundShortcode) {
      // Advance the parser state after processing all shortcodes on the line
      state.line = startLine + 1;
      return true;
    }

    return false;
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
