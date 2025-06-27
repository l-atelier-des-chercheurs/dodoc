// grabbed from https://github.com/furutsubaki/markdown-it-custom-short-codes

"use strict";
const tags_list = ["image", "video", "audio", "embed", "break"];

export default (md, o = {}) => {
  const renderMedia = o.renderMedia;

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

      // Check if this looks like a shortcode by checking for "tag:" pattern
      const potentialShortcode = lineText.substring(openParenPos);
      const shortcodePattern = /^\(([-\w]+):\s/;
      const tagMatch = shortcodePattern.exec(potentialShortcode);
      const isShortcode = tagMatch && tags_list.includes(tagMatch[1]);

      if (!isShortcode) {
        pos++;
        lineText = state.src.slice(pos, max);
        continue;
      }

      // If there's text before the opening parenthesis, add it as a paragraph
      if (openParenPos > 0) {
        const textBefore = lineText.substring(0, openParenPos).trim();
        if (textBefore) {
          let token = state.push("paragraph_open", "p", 1);
          token.map = [startLine, startLine + 1];
          token = state.push("text", "", 0);
          token.content = textBefore;
          token.map = [startLine, startLine + 1];
          token = state.push("paragraph_close", "p", -1);
          token.map = [startLine, startLine + 1];
        }
      }

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

      // We already have the tag from earlier tagMatch
      const tag = tagMatch[1].trim();

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
      if (token.tag === "break") {
        return `<div class="break break-${token.attrs.src}"></div>\n`;
      }

      // Handle external URLs using renderMedia
      if (token.attrs.src.startsWith("http")) {
        const alt = token.attrs.caption || "";
        const width = token.attrs.width || "";
        const height = token.attrs.height || "";
        const title = token.attrs.title || "";

        let html = `
            <img src="${token.attrs.src}"
              alt="${alt}"
              ${width ? ` width="${width}"` : ""}
              ${height ? ` height="${height}"` : ""}
            />
          `;

        // Apply custom classes and attributes if specified
        let processedHtml = html;
        if (token.attrs.class || token.attrs.float) {
          const customClasses = [];
          if (token.attrs.class) customClasses.push(token.attrs.class);
          if (token.attrs.float)
            customClasses.push(`float-${token.attrs.float}`);

          if (customClasses.length > 0) {
            // Add custom classes to the figure element
            processedHtml = html.replace(
              'class="media',
              `class="media ${customClasses.join(" ")}`
            );
          }

          return processedHtml;
        }
        return processedHtml;
      }

      // Use renderMedia for local media
      if (renderMedia) {
        const alt = token.attrs.caption || "";
        const width = token.attrs.width || "";
        const height = token.attrs.height || "";
        const title = token.attrs.title || "";

        const { html, is_qr_code } = renderMedia({
          meta_src: token.attrs.src,
          alt,
          width: token.attrs.width,
          height: token.attrs.height,
          title,
        });

        if (!html || html.includes("Media not found")) {
          return `<figure class="media media-error"><i>⚠️ Media not found</i></figure>`;
        }

        // Apply custom classes and attributes if specified
        let processedHtml = html;
        if (token.attrs.class || token.attrs.float) {
          const customClasses = [];
          if (token.attrs.class) customClasses.push(token.attrs.class);
          if (token.attrs.float)
            customClasses.push(`float-${token.attrs.float}`);

          if (customClasses.length > 0) {
            // Add custom classes to the figure element
            processedHtml = html.replace(
              'class="media',
              `class="media ${customClasses.join(" ")}`
            );
          }
        }

        return processedHtml;
      }

      // Fallback if no renderMedia function
      return `<figure class="media media-error"><i>⚠️ Media not found</i></figure>`;
    } else if (token.tag === "break") {
      return `<div class="break break-${token.attrs.type}"></div>\n`;
    } else {
      return token.content + "\n";
    }
  };

  // insert csc rule
  md.block.ruler.before("paragraph", "csc", csc);
};
