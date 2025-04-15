"use strict";
const markerPattern = /^\(([\w-]+):\s*([^)]+)\)/im;

const tags_list = ["image"];

export default (md, o) => {
  const cscRegexp = markerPattern;

  function csc(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];

    let marker = state.src.charCodeAt(pos);

    // check ( marker
    if (marker !== 0x28 /* ( */) return false;

    // check csc pattern
    let match = cscRegexp.exec(state.src.substr(pos));
    match = !match
      ? []
      : match.filter(function (m) {
          return m;
        });
    if (match.length < 2) {
      return false;
    }

    if (silent) return true;

    state.line = startLine + 1;

    // create token data
    let tag = match[1].trim(); // e.g. 'image'
    let content = match[2].trim(); // e.g. 'filename.jpg'

    if (!tags_list.includes(tag)) {
      return false;
    }

    // Parse any additional attributes after the main content
    let attrs = {};
    const attrMatches = content.match(/\s+(\w+)=["']([^"']+)["']/g);
    if (attrMatches) {
      attrMatches.forEach((attr) => {
        const [key, value] = attr.trim().split("=");
        attrs[key] = value.replace(/['"]/g, "");
      });
      // Remove the attributes from content
      content = content.replace(/\s+\w+=["'][^"']+["']/g, "").trim();
    }
    attrs.src = content;

    let markup = match[0];

    // set token
    let token = state.push("csc", tag, 0);
    token.map = [startLine, state.line];
    token.markup = markup;
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
        return `<img src="${token.attrs.src}"${
          token.attrs.alt ? ` alt="${token.attrs.alt}"` : ""
        }${token.attrs.width ? ` width="${token.attrs.width}"` : ""}${
          token.attrs.height ? ` height="${token.attrs.height}"` : ""
        } />\n`;
      default:
        return token.content + "\n";
    }
  };

  // insert csc rule
  md.block.ruler.before("paragraph", "csc", csc);
};
