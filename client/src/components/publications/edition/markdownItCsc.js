// grabbed from https://github.com/furutsubaki/markdown-it-custom-short-codes

"use strict";
const tags_list = ["image", "video", "audio", "embed", "pdf", "break"];

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

      // Find matching closing parenthesis accounting for nesting and quoted strings
      // Rule: If a value contains a closing parenthesis, it MUST be quoted
      let depth = 0;
      let closeParenPos = -1;
      let inQuotes = false;
      let quoteChar = null;
      for (let i = 0; i < remainingText.length; i++) {
        const char = remainingText[i];
        if (!inQuotes && (char === '"' || char === "'")) {
          // Start of quoted string
          inQuotes = true;
          quoteChar = char;
        } else if (inQuotes && char === quoteChar) {
          // End of quoted string
          inQuotes = false;
          quoteChar = null;
        } else if (!inQuotes) {
          // Only count parentheses when not inside quotes
          if (char === "(") {
            depth++;
          } else if (char === ")") {
            depth--;
            if (depth === 0) {
              closeParenPos = i;
              break;
            }
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
        // Keep the full attrString including closing paren - we'll handle it during parsing
        attrString = afterTag.substring(firstAttrPos);
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

      // Simplified attribute parsing:
      // Rule: If a value contains a closing parenthesis, it MUST be quoted
      // 1. Quoted values: caption: "Hello :)"
      // 2. Unquoted values: width: 1cm (stops at next attribute or closing paren)

      let attrPos = 0;
      const attrLen = attrString.length;

      while (attrPos < attrLen) {
        // Skip whitespace
        while (attrPos < attrLen && /\s/.test(attrString[attrPos])) {
          attrPos++;
        }
        if (attrPos >= attrLen) break;

        // Find attribute key (word characters and hyphens)
        const keyStart = attrPos;
        while (attrPos < attrLen && /[\w-]/.test(attrString[attrPos])) {
          attrPos++;
        }
        if (attrPos === keyStart) break; // No key found

        const key = attrString.substring(keyStart, attrPos);

        // Skip whitespace before colon
        while (attrPos < attrLen && /\s/.test(attrString[attrPos])) {
          attrPos++;
        }

        // Expect colon
        if (attrPos >= attrLen || attrString[attrPos] !== ":") break;
        attrPos++; // Skip colon

        // Skip whitespace after colon
        while (attrPos < attrLen && /\s/.test(attrString[attrPos])) {
          attrPos++;
        }
        if (attrPos >= attrLen) break;

        // Parse value (quoted or unquoted)
        let value = "";

        // Check if value is quoted
        const quoteChar = attrString[attrPos];
        if (quoteChar === '"' || quoteChar === "'") {
          attrPos++; // Skip opening quote
          // Find closing quote - everything between quotes is the value (including closing parens)
          const quoteEnd = attrString.indexOf(quoteChar, attrPos);
          if (quoteEnd !== -1) {
            // Valid quoted value - extract everything between the quotes
            value = attrString.substring(attrPos, quoteEnd);
            attrPos = quoteEnd + 1; // Skip closing quote
            // Skip any whitespace after the closing quote
            while (attrPos < attrLen && /\s/.test(attrString[attrPos])) {
              attrPos++;
            }
          } else {
            // Unclosed quote - take rest of string up to closing paren
            const rest = attrString.substring(attrPos);
            const parenIndex = rest.indexOf(")");
            if (parenIndex !== -1) {
              value = rest.substring(0, parenIndex);
              attrPos = attrLen; // Stop parsing
            } else {
              value = rest;
              attrPos = attrLen;
            }
          }
        } else {
          // Unquoted value - stops at next attribute or closing paren
          // Look for next attribute pattern: whitespace + word + colon
          let valueEnd = attrLen;
          const remaining = attrString.substring(attrPos);
          const nextAttrMatch = /\s+[\w-]+:\s+/.exec(remaining);
          if (nextAttrMatch) {
            valueEnd = attrPos + nextAttrMatch.index;
          } else {
            // No next attribute, find closing paren
            const parenIndex = attrString.indexOf(")", attrPos);
            if (parenIndex !== -1) {
              valueEnd = parenIndex;
            }
          }

          value = attrString.substring(attrPos, valueEnd).trim();
          attrPos = valueEnd;
        }

        attrs[key] = value;
      }

      // If this is the first shortcode on the line and there might be more, add a container start token
      if (shortcodeCount === 0) {
        // Store the position to check for more shortcodes
        const checkPos = pos + shortcodeText.length;
        const remainingLine = state.src.slice(checkPos, max).trim();
        // console.log("DEBUG CONTAINER: remainingLine", JSON.stringify(remainingLine));

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

  // Helper function to apply custom classes to HTML
  function applyCustomClasses(html, classAttr, floatAttr) {
    if (!classAttr && !floatAttr) return html;

    const customClasses = [];
    if (classAttr) customClasses.push(classAttr);
    if (floatAttr) customClasses.push(`float-${floatAttr}`);

    if (customClasses.length > 0) {
      return html.replace(
        'class="media',
        `class="media ${customClasses.join(" ")}`
      );
    }
    return html;
  }

  // set render csc
  md.renderer.rules.csc = function (tokens, index, type) {
    const token = tokens[index];
    if (!token.content) return "";

    // Handle different types of shortcodes
    if (tags_list.includes(token.tag)) {
      if (token.tag === "break") {
        return `<div class="break break-${token.attrs.src}"></div>\n`;
      }

      // Use renderMedia for both external URLs and local media
      if (renderMedia) {
        const alt = token.attrs.caption || "";
        const width = token.attrs.width || "";
        const height = token.attrs.height || "";
        const title = token.attrs.title || "";
        const size = token.attrs.size || "";

        const { html, is_qr_code } = renderMedia({
          meta_src: token.attrs.src,
          alt,
          width: token.attrs.width,
          height: token.attrs.height,
          title,
          size,
          tag: token.tag,
        });

        if (!html || html.includes("Media not found")) {
          return `<figure class="media media-error"><i>⚠️ Media not found</i></figure>`;
        }

        // Apply custom classes and attributes if specified
        return applyCustomClasses(html, token.attrs.class, token.attrs.float);
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
  md.block.ruler.before("paragraph", "csc", csc, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
};
