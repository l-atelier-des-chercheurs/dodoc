exports.getFrontMatter = function(lines) {
  if ((/^---/).test(lines[0].trim())) {
    var frontMatter = [];
    lines.shift();
    var line;
    // Keep shifting off lines till we find the next ---
    while (!(/^---/).test(line = lines.shift().trim())) {
      frontMatter.push(line);
    } 
    return frontMatter.join('\n');
  } else {
    return '';
  }
};
