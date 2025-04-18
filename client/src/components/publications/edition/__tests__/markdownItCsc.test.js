import { describe, it, expect } from "vitest";
import MarkdownIt from "markdown-it";
import markdownItCsc from "../markdownItCsc";

describe("markdown-it custom shortcode plugin", () => {
  const md = new MarkdownIt();
  md.use(markdownItCsc);

  it("should render a basic image with src", () => {
    const input = "(image: https://example.com/image.jpg)";
    const output = md.render(input);
    expect(output).toContain('<img src="https://example.com/image.jpg" />');
  });

  it("should render an image with caption", () => {
    const input =
      "(image: https://example.com/image.jpg caption: A beautiful image)";
    const output = md.render(input);
    expect(output).toContain('<img src="https://example.com/image.jpg" />');
    expect(output).toContain(
      '<div class="mediaCaption"><span>A beautiful image</span></div>'
    );
  });

  it("should render an image with width and height", () => {
    const input =
      "(image: https://example.com/image.jpg width: 100 height: 100)";
    const output = md.render(input);
    expect(output).toContain(
      '<img src="https://example.com/image.jpg" width="100" height="100" />'
    );
  });

  it("should render an image with all attributes in any order", () => {
    const input =
      "(image: https://example.com/image.jpg height: 100 caption: Nice pic width: 100)";
    const output = md.render(input);
    expect(output).toContain(
      '<img src="https://example.com/image.jpg" width="100" height="100" />'
    );
    expect(output).toContain(
      '<div class="mediaCaption"><span>Nice pic</span></div>'
    );
  });

  it("should not render non-image shortcodes", () => {
    const input = "(video: https://example.com/video.mp4)";
    const output = md.render(input);
    expect(output).not.toContain("<video");
    expect(output).toContain("(video: https://example.com/video.mp4)");
  });

  it("should handle malformed shortcodes gracefully", () => {
    const inputs = [
      "(image:)",
      "(image: )",
      "(image: https://example.com/image.jpg caption:)",
      "(image https://example.com/image.jpg)",
    ];

    inputs.forEach((input) => {
      const output = md.render(input);
      expect(output).toBe(input + "\n");
    });
  });

  it("should handle multiple shortcodes in the same text", () => {
    const input = `
(image: https://example.com/image1.jpg caption: First image)
Some text in between
(image: https://example.com/image2.jpg caption: Second image)
    `.trim();

    const output = md.render(input);
    expect(output).toContain("First image");
    expect(output).toContain("Second image");
    expect(output).toContain("Some text in between");
  });

  it("should preserve other markdown syntax around shortcodes", () => {
    const input = `
# Title
(image: https://example.com/image.jpg caption: An image)
**Bold text** and _italic text_
    `.trim();

    const output = md.render(input);
    expect(output).toContain("<h1>Title</h1>");
    expect(output).toContain('<img src="https://example.com/image.jpg" />');
    expect(output).toContain("<strong>Bold text</strong>");
    expect(output).toContain("<em>italic text</em>");
  });
});
