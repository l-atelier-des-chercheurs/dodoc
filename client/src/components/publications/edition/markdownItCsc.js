// grabbed from https://github.com/furutsubaki/markdown-it-custom-short-codes

"use strict";
// Match the main tag and content, followed by any number of attributes
const markerPattern =
  /\(([\w-]+):\s+([^\s]+)(?:\s+([\w-]+):\s+([^)\s](?:.*?(?=\s+[\w-]+:|$)|[^)]*)))*\)/im;

const tags_list = ["image"];

export default (md, o) => {
  const cscRegexp = markerPattern;

  function csc(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];

    let marker = state.src.charCodeAt(pos);

    // check ( marker
    if (marker !== 0x28 /* ( */) return false;

    // Get the full match text
    const fullText = state.src.substr(pos);

    console.log("Attempting to match:", fullText);

    // First check if it matches our basic pattern
    let match = cscRegexp.exec(fullText);
    if (!match) {
      console.log("No match found for basic pattern");
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
      if (key !== "image") {
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
        const attrs = [];

        // Add src attribute
        attrs.push(`src="${token.attrs.src}"`);

        // Add all other attributes except caption
        for (const [key, value] of Object.entries(token.attrs)) {
          if (key !== "src" && key !== "caption") {
            attrs.push(`${key}="${value}"`);
          }
        }

        // Create the image tag with all attributes
        const imgTag = `<img ${attrs.join(" ")} />`;

        // Add caption if it exists and is not empty
        const caption =
          token.attrs.caption !== undefined && token.attrs.caption !== ""
            ? `\n<div class="mediaCaption"><span>${token.attrs.caption}</span></div>`
            : "";

        return imgTag + caption + "\n";
      default:
        return token.content + "\n";
    }
  };

  // insert csc rule
  md.block.ruler.before("paragraph", "csc", csc);
};
