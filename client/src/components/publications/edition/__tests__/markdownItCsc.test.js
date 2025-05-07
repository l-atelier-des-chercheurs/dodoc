// (image: https://example.com/image.jpg caption: A beautiful image) should return
// {
//   tag: "image",
//   content: "https://example.com/image.jpg",
//   caption: "A beautiful image"
// }
// (image: https://example.com/image.jpg caption: A beautiful image width: 100 height: 100)
// or
// (image: https://example.com/image.jpg width: 100 height: 100 caption: A beautiful image)
// {
//   tag: "image",
//   content: "https://example.com/image.jpg",
//   caption: "A beautiful image",
//   width: "100",
//   height: "100"
// }
// (image https://example.com/image.jpg) should return as text
// (image:plop) should return as text
// (image: https://example.com/image.jpg caption:) should return {
//   tag: "image",
//   content: "https://example.com/image.jpg",
//   caption: ""
// }
// (image: https://latelier-des-chercheurs.fr/content/apercu.png caption: a width: 50%) (image: https://latelier-des-chercheurs.fr/content/apercu.png caption: a width: 50%)
// should return two adjacent blocks

import { describe, it, expect } from "vitest";
import MarkdownIt from "markdown-it";
import markdownItCsc from "../markdownItCsc";

describe("markdown-it custom shortcode plugin", () => {
  const md = new MarkdownIt();
  md.use(markdownItCsc);

  it("should render a basic image with src", () => {
    const input = "(image: https://example.com/image.jpg)";
    const output = md.render(input);
    expect(output).toContain(
      '<figure class="media"><img src="https://example.com/image.jpg" /></figure>'
    );
  });

  it("should render an image with caption", () => {
    const input =
      "(image: https://example.com/image.jpg caption: A beautiful image)";
    const output = md.render(input);
    expect(output).toContain('<img src="https://example.com/image.jpg" />');
    expect(output).toContain(
      '<figcaption class="mediaCaption"><span>A beautiful image</span></figcaption>'
    );
  });

  it("should render an image with width and height", () => {
    const input =
      "(image: https://example.com/image.jpg width: 100 height: 100)";
    const output = md.render(input);
    expect(output).toBe(
      '<figure class="media" width="100" height="100"><img src="https://example.com/image.jpg" /></figure>\n'
    );
  });

  it("should render video shortcodes", () => {
    const input = "(video: https://example.com/video.mp4)";
    const output = md.render(input);
    expect(output).toBe(
      '<figure class="media"><video src="https://example.com/video.mp4" controls></video></figure>\n'
    );
  });

  it("should render audio shortcodes", () => {
    const input = "(audio: https://example.com/audio.mp3)";
    const output = md.render(input);
    expect(output).toBe(
      '<figure class="media"><audio src="https://example.com/audio.mp3" controls></audio></figure>\n'
    );
  });

  it("should handle malformed shortcodes gracefully", () => {
    const inputs = [
      "(image:)",
      "(image: )",
      "(image https://example.com/image.jpg)",
    ];

    inputs.forEach((input) => {
      const output = md.render(input);
      expect(output).toBe("<p>" + input + "</p>\n");
    });
  });

  it("should handle multiple shortcodes on different lines", () => {
    const input = `
(image: https://example.com/image1.jpg caption: First image)
Some text in between
(image: https://example.com/image2.jpg caption: Second image)
    `.trim();

    const output = md.render(input);
    expect(output).toBe(
      '<figure class="media"><img src="https://example.com/image1.jpg" />\n' +
        '<figcaption class="mediaCaption"><span>First image</span></figcaption></figure>\n' +
        "<p>Some text in between</p>\n" +
        '<figure class="media"><img src="https://example.com/image2.jpg" />\n' +
        '<figcaption class="mediaCaption"><span>Second image</span></figcaption></figure>\n'
    );
  });

  it("should preserve other markdown syntax around shortcodes", () => {
    const input = `
# Title
(image: https://example.com/image.jpg caption: An image)
**Bold text** and _italic text_
    `.trim();

    const output = md.render(input);
    expect(output).toBe(
      "<h1>Title</h1>\n" +
        '<figure class="media"><img src="https://example.com/image.jpg" />\n' +
        '<figcaption class="mediaCaption"><span>An image</span></figcaption></figure>\n' +
        "<p><strong>Bold text</strong> and <em>italic text</em></p>\n"
    );
  });

  // it should handle class attribute
  it("should handle class attribute", () => {
    const input = "(image: https://example.com/image.jpg class: maclass)";
    const output = md.render(input);
    expect(output).toContain(
      '<figure class="media maclass"><img src="https://example.com/image.jpg" /></figure>'
    );
  });

  // it should handle class attribute
  it("should handle multiple class attributes", () => {
    const input =
      "(image: https://example.com/image.jpg class: maclass maclass2)";
    const output = md.render(input);
    expect(output).toContain(
      '<figure class="media maclass maclass2"><img src="https://example.com/image.jpg" /></figure>'
    );
  });

  // (video: signal-2025-04-13-114237-002.mp4.meta.txt caption: Plop Plip [qqq](https://geojson.io) Hehehe)
  it("should handle shortcodes with links in caption", () => {
    const input =
      "(video: https://latelier-des-chercheurs.fr/content/apercu.png caption: Plop Plip [qqq](https://geojson.io) Hehehe)";
    const output = md.render(input);
    expect(output).toContain(
      `<figure class="media"><video src="https://latelier-des-chercheurs.fr/content/apercu.png" controls></video>`
    );
    expect(output).toContain(
      `<figcaption class="mediaCaption"><span>Plop Plip <a href="https://geojson.io">qqq</a> Hehehe</span></figcaption>`
    );
  });

  it("should handle multiple shortcodes on the same line and put them in a container", () => {
    const input = `(image: https://example.com/image1.jpg)(audio: https://example.com/audio1.mp3)`;

    const output = md.render(input);
    expect(output).toContain('<div class="media-container">');
    expect(output).toContain(
      '<figure class="media"><img src="https://example.com/image1.jpg" /></figure>'
    );
    expect(output).toContain(
      '<figure class="media"><audio src="https://example.com/audio1.mp3" controls></audio></figure>'
    );
    expect(output).toContain("</div>");
  });

  it("should not wrap a single shortcode in a container", () => {
    const input = `(image: https://example.com/image1.jpg)`;

    const output = md.render(input);
    expect(output).not.toContain('<div class="media-container">');
    expect(output).toBe(
      '<figure class="media"><img src="https://example.com/image1.jpg" /></figure>\n'
    );
  });
});
