// Markdown collapses any number of blank lines into one paragraph break.
// Keep the extra ones so authors can ask for more room without resorting to
// a lone "\" per line:
//   1 blank line  -> 2 paragraphs
//   2 blank lines -> 2 paragraphs with one <br> in between
//   3 blank lines -> 2 <br>, and so on
// Fenced code blocks are left untouched.

const FENCED_CODE = /(^(?:```|~~~)[^\n]*\n[\s\S]*?^(?:```|~~~)[ \t]*$)/m;
const EXTRA_BLANK_LINES = /\n(?:[ \t]*\n){2,}/g;

export function keepExtraBlankLines(content) {
  if (!content) return content;
  return content
    .split(FENCED_CODE)
    .map((part, index) => {
      // odd indexes are the captured code blocks
      if (index % 2 === 1) return part;
      return part.replace(EXTRA_BLANK_LINES, (match) => {
        const blank_lines = match.split("\n").length - 2;
        return "\n\n" + "<br>\n\n".repeat(blank_lines - 1);
      });
    })
    .join("");
}
