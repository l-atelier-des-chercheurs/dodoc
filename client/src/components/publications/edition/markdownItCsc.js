// grabbed from https://github.com/furutsubaki/markdown-it-custom-short-codes

"use strict";
// Pattern to capture tag, src, and the rest (attributes)
// It captures: 1:tag, 2:src, 3:attribute string
const markerPattern = /\(([-\w]+):\s*([^\s)]+)\s*(.*?)\)/;

// Updated pattern that supports nested parentheses
const markerPatternWithNesting =
  /\(([-\w]+):\s*([^]+?)(?=\s+[\w-]+:|\s*\)$)\s*(.*?)\)/;

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

      // Find matching closing parenthesis accounting for nesting
      let depth = 0;
      let closeParenPos = -1;
      for (let i = 0; i < remainingText.length; i++) {
        if (remainingText[i] === "(") {
          depth++;
        } else if (remainingText[i] === ")") {
          depth--;
          if (depth === 0) {
            closeParenPos = i;
            break;
          }
        }
      }

      if (closeParenPos === -1) {
        pos++;
        lineText = state.src.slice(pos, max);
        continue;
      }

      // Extract the full shortcode including parentheses
      const shortcodeText = remainingText.substring(0, closeParenPos + 1);

      // Parse the shortcode using a simple extraction approach
      // Format is expected to be: (tag: source attr1: val1 attr2: val2)
      const tagMatch = /^\(([-\w]+):\s*/.exec(shortcodeText);

      if (!tagMatch) {
        pos++;
        lineText = state.src.slice(pos, max);
        continue;
      }

      const tag = tagMatch[1].trim();

      if (!tags_list.includes(tag)) {
        pos++;
        lineText = state.src.slice(pos, max);
        continue;
      }

      if (silent) return true;

      // Extract content after "tag: " and before the first attribute or closing paren
      const afterTag = shortcodeText.substring(tagMatch[0].length);

      // Look for the first attribute marker (word followed by colon)
      const firstAttrMatch = /\s+[\w-]+:\s+/.exec(afterTag);
      let source, attrString;

      if (firstAttrMatch) {
        const firstAttrPos = firstAttrMatch.index;
        source = afterTag.substring(0, firstAttrPos).trim();
        attrString = afterTag
          .substring(firstAttrPos, afterTag.length - 1)
          .trim(); // Remove closing parenthesis
      } else {
        // No attributes, just source
        source = afterTag.substring(0, afterTag.length - 1).trim();
        attrString = "";
      }

      // Parse attributes
      let attrs = {};
      attrs.src = source;

      // Improved attribute parsing pattern
      // Look for attribute keys followed by a colon, then capture everything up to the next attribute key
      const attrPattern = /([\w-]+):\s+((?:(?!\s+[\w-]+:).)+)/g;
      let attrMatch;

      while ((attrMatch = attrPattern.exec(attrString + " "))) {
        const key = attrMatch[1].trim();
        const value = attrMatch[2] ? attrMatch[2].trim() : "";
        if (key) {
          // Ensure key is not empty
          attrs[key] = value;
        }
      }

      // Special handling for the last attribute - make sure no trailing ")" is included
      const lastAttrKey = Object.keys(attrs).pop();
      if (lastAttrKey && lastAttrKey !== "src") {
        const lastValue = attrs[lastAttrKey];
        if (lastValue && lastValue.endsWith(")")) {
          attrs[lastAttrKey] = lastValue.slice(0, -1);
        }
      }

      // Set token
      let token = state.push("csc", tag, 0);
      token.map = [startLine, startLine + 1];
      token.markup = shortcodeText;
      token.attrs = attrs;
      token.content = source;

      // Move position forward by the length of the shortcode
      pos += shortcodeText.length;
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
