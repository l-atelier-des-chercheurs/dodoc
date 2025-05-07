// grabbed from https://github.com/furutsubaki/markdown-it-custom-short-codes

"use strict";
// Pattern to capture tag, src, and the rest (attributes)
// It captures: 1:tag, 2:src, 3:attribute string
const markerPattern = /\(([-\w]+):\s*([^\s)]+)\s*(.*?)\)/;

// Updated pattern that supports nested parentheses
const markerPatternWithNesting =
  /\(([-\w]+):\s*([^]+?)(?=\s+[\w-]+:|\s*\)$)\s*(.*?)\)/;

const tags_list = ["image", "video", "audio", "embed"];

export default (md, o = {}) => {
  const vue_instance = o.vue_instance;

  function csc(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    let lineText = state.src.slice(pos, max);
    let foundShortcode = false;
    let shortcodeCount = 0;

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

      // Malformed shortcode: no source and no attributes -> skip parsing
      if (!source && !attrString) {
        pos++;
        lineText = state.src.slice(pos, max);
        continue;
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

      // If this is the first shortcode on the line and there might be more, add a container start token
      if (shortcodeCount === 0) {
        // Store the position to check for more shortcodes
        const checkPos = pos + shortcodeText.length;
        const remainingLine = state.src.slice(checkPos, max).trim();

        // Check if there are more shortcodes on this line
        if (remainingLine.startsWith("(") && /^\([-\w]+:/.test(remainingLine)) {
          // Add a container opening token
          let containerToken = state.push("container_open", "div", 1);
          containerToken.attrSet("class", "media-container");
          containerToken.map = [startLine, startLine + 1];
        }
      }

      // Set token
      let token = state.push("csc", tag, 0);
      token.map = [startLine, startLine + 1];
      token.markup = shortcodeText;
      token.attrs = attrs;
      token.content = source;
      shortcodeCount++;

      // Move position forward by the length of the shortcode
      pos += shortcodeText.length;
      lineText = state.src.slice(pos, max);
      foundShortcode = true;
    }

    // If we found multiple shortcodes, add a container closing token
    if (shortcodeCount > 1) {
      state.push("container_close", "div", -1);
    }

    if (foundShortcode) {
      // Advance the parser state after processing all shortcodes on the line
      state.line = startLine + 1;
      return true;
    }

    return false;
  }

  // Register custom container renderer
  md.renderer.rules.container_open = function (tokens, idx) {
    return `<div class="${tokens[idx].attrGet("class")}">\n`;
  };

  md.renderer.rules.container_close = function () {
    return "</div>\n";
  };

  // set render csc
  md.renderer.rules.csc = function (tokens, index, type) {
    const token = tokens[index];
    if (!token.content) return "";

    // Handle different types of shortcodes
    if (tags_list.includes(token.tag)) {
      // Use getMediaSrc if available, otherwise fallback to normal behavior
      let media = null;
      if (
        vue_instance &&
        vue_instance.getMediaSrc &&
        !token.attrs.src.startsWith("http")
      ) {
        media = vue_instance.getMediaSrc(
          token.attrs.src,
          vue_instance.source_medias
        );
      }

      const attrs = [];

      let src = "";
      if (media) {
        src = media.src;
      } else if (token.attrs.src.startsWith("http")) {
        src = token.attrs.src;
      } else {
        let msg = "⚠️ ";
        msg += vue_instance.$t
          ? vue_instance.$t("media_not_found")
          : "Media not found";
        return `<div class="media media-error"><i>${msg}</i></div>`;
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

      let classes = ["media", "media-" + token.tag];
      if (class_attr) {
        classes.push(class_attr);
      }

      // Create the image tag with all attributes
      const attrs_str = attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
      let media_tag = `<figure class="${classes.join(" ")}"${attrs_str}>`;

      if (token.tag === "image") {
        media_tag += `<img src="${src}" />`;
      } else if (token.tag === "video") {
        media_tag += `<video src="${src}" controls>`;
        media_tag += "</video>";
      } else if (token.tag === "audio") {
        media_tag += `<audio src="${src}" controls>`;
        media_tag += "</audio>";
      } else if (token.tag === "embed") {
        if (vue_instance && vue_instance.transformURL) {
          const embed = vue_instance.transformURL({
            url: src,
            autoplay: false,
          });
          media_tag += `<iframe src="${embed.src}" allowfullscreen allowtransparency allow="autoplay" frameborder="0"></iframe>`;
        } else {
          media_tag += `<iframe src="${src}" allowfullscreen allowtransparency allow="autoplay" frameborder="0"></iframe>`;
        }
      }

      // Add caption if it exists and is not empty
      const markdownCaption = token.attrs.caption;

      const caption =
        markdownCaption !== undefined && markdownCaption !== ""
          ? `\n<figcaption class="mediaCaption"><span>${md.renderInline(
              markdownCaption
            )}</span></figcaption>`
          : "";

      return media_tag + caption + "</figure>\n";
    } else {
      return token.content + "\n";
    }
  };

  // insert csc rule
  md.block.ruler.before("paragraph", "csc", csc);
};
