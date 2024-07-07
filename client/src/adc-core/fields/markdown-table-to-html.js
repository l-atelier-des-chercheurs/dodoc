const alignments = ["left", "center", "right"];

/**
 * Converts a markdown table string into HTML.
 * @param {string} md Markdown table as a string.
 */

export function mdTableToArray(md) {
  var lines = getLines(md);
  var isHeader = true;
  var table_header = [];
  var table_rows = [];
  //   var colAlignments = [];

  debugger;

  lines.forEach(function (line) {
    if (isHeaderSeparation(line)) {
      isHeader = false;
      //   colAlignments = getAlignment(line);
      return;
    }
    var vals = splitLine(line);
    if (isHeader) {
      table_header = table_header.concat(vals);
    } else {
      table_rows.push(vals);
    }
  });
  //   table.setAlignments(colAlignments);
  return { table_header, table_rows };
}
function mdTableToHTML(md) {
  var lines = getLines(md);
  var isHeader = true;
  var table = new HTMLTable();
  var colAlignments = [];

  debugger;
  lines.forEach(function (line) {
    if (isHeaderSeparation(line)) {
      isHeader = false;
      colAlignments = getAlignment(line);
      return;
    }
    var vals = splitLine(line);
    table.addRow(vals, isHeader);
  });
  table.setAlignments(colAlignments);
  return {
    html: table.getHTML(),
    htmlString: table.getHTMLString(),
  };
}

/**
 * Converts a document into an array of string, where each element corresponds to one row.
 * @param {string} doc Document
 * @returns {string[]} The lines of the document.
 */
function getLines(doc) {
  return doc.replace(/\r\n/g, "\n").split("\n");
}

/**
 * Checks whether a line contains the table syntax that separates table header from body.
 * Example for a separation line: "| --- |:---:| ---:|"
 * @param {string} line A line of a markdown document.
 * @returns {boolean} True if the line is a separation line.
 */
function isHeaderSeparation(line) {
  let match = line.match(/(\|\s*(:)?\s*-{3,}\s*(:)?\s*)+\|/g);
  if (!Array.isArray(match)) return false;
  return match.length > 0;
}

/**
 * Reads the column alignment information from a separation line.
 * E.g. "| --- |:---:| ---:|" is ['left', 'center', 'right']
 * @param {string} headerLine A line for which isHeaderSeparation returns true.
 * @returns {string[]} The alignment of each column, entries are in ['left', 'center', 'right'].
 */
function getAlignment(headerLine) {
  let parts = splitLine(headerLine);

  return parts.map((col) => {
    if (col.length === 0) return alignments[0];
    let firstChar = col.charAt(0),
      lastChar = col.slice(-1);
    if (firstChar === ":" && lastChar === ":") return alignments[1];
    if (lastChar === ":") return alignments[2];
    return alignments[0];
  });
}

/**
 * Converts an alignment into the corresponding style tag.
 * Empty string for alignment: left (default).
 * @param {string} alignment Alignment, i.e. either of ['left', 'center', 'right'].
 * @returns {string} The style attribute with text-alignment.
 */
function getStyleAttribute(alignment) {
  if (alignment === alignments[0]) return "";
  return ' style="text-align: ' + alignment + ';"';
}

/**
 * Splits a Markdown table line into its trimmed column values.
 * @param {string} line Markdown table line.
 * @returns {string[]} The trimmed column values.
 */
function splitLine(line) {
  return line
    .split("|")
    .map((x) => x.trim())
    .filter((x, i, a) => {
      return x.length > 0 || [0, a.length].indexOf(i) === -1;
    });
}

/**
 * HTML table creation helper class.
 * Constructs the table and returns the HTML code.
 */
function HTMLTable() {
  this.ths = [];
  this.tds = [];
  this.alignments = [];

  this.getHTMLString = function () {
    let newline = "\n";
    return (
      "<table>" +
      newline +
      this.ths
        .map((x) => {
          return this.getRow(x, "th");
        }, this)
        .join(newline) +
      newline +
      this.tds
        .map((x) => {
          return this.getRow(x, "td");
        }, this)
        .join(newline) +
      newline +
      "</table>"
    );
  };

  this.getHTML = function () {
    return (
      '<table class="table">' +
      this.ths
        .map((x, index) => {
          return this.getRow(x, "th");
        }, this)
        .join("") +
      this.tds
        .map((x, index) => {
          return this.getRow(x, "td");
        }, this)
        .join("") +
      "</table>"
    );
  };

  this.getRow = function (vals, tag) {
    return (
      "<tr>" +
      vals
        .map((x, index) => {
          return (
            "<" +
            tag +
            getStyleAttribute(this.getAlignment(index)) +
            ">" +
            x +
            "</" +
            tag +
            ">"
          );
        })
        .join("") +
      "</tr>"
    );
  };

  this.addRow = function (vals, isHeader) {
    if (isHeader) {
      this.ths.push(vals);
    } else {
      this.tds.push(vals);
    }
  };

  this.setAlignments = function (alignments) {
    this.alignments = alignments;
  };

  this.getAlignment = function (colIndex) {
    if (this.alignments.length <= colIndex) return alignments[0];
    return this.alignments[colIndex];
  };
}
