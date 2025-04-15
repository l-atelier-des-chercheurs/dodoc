"use strict";
const markerPattern = /^\[\[(.*)\]\]/im;

export default (md, o) => {
  const cscRegexp = markerPattern;

  function csc(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];

    let marker = state.src.charCodeAt(pos);

    // check [ marker
    if (marker !== 0x5b /* [ */) return false;

    // check csc pattern
    let match = cscRegexp.exec(state.src.substr(pos));
    match = !match
      ? []
      : match.filter(function (m) {
          return m;
        });
    if (match.length < 1) {
      return false;
    }

    if (silent) return true;

    state.line = startLine + 1;

    // create token data
    let tag = match[1].split(" ")[0];
    let tmp_attrs = match[1].split(" ");
    tmp_attrs.shift();
    let attrs = {};
    for (let attr of tmp_attrs) {
      attrs[attr.split("=")[0]] = attr.split("=")[1] || "";
    }
    let markup = match[0];

    // set token
    let token = state.push("csc", tag, 0);
    token.map = [startLine, state.line];
    token.markup = markup;
    token.attrs = attrs;

    return true;
  }

  // set render csc
  md.renderer.rules.csc = function (tokens, index, type) {
    if (tokens[index].content.length === 0) return "";

    return tokens[index].content + "\n";
  };

  // insert csc rule
  md.block.ruler.before("paragraph", "csc", csc);
};
