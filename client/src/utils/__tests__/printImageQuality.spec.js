import { describe, it, expect } from "vitest";
import {
  getPrintDPI,
  imageSourceAttributes,
  pickSourceForPrint,
  requiredLongSideForPrint,
} from "@/utils/printImageQuality.js";

// 1 CSS px = 1/96 inch, A3 width = 297mm ≈ 1123px
const a3_width = (297 / 25.4) * 96;

describe("getPrintDPI", () => {
  it("maps qualities to dpi and source to none", () => {
    expect(getPrintDPI("high")).toBe(300);
    expect(getPrintDPI("medium")).toBe(150);
    expect(getPrintDPI("source")).toBe(false);
    expect(getPrintDPI(undefined)).toBe(false);
  });
});

describe("requiredLongSideForPrint", () => {
  // 3:2, like the boxes below
  const photo = { natural_width: 2400, natural_height: 1600 };

  it("needs more than a 2000px thumb for a full width A3 image at 300dpi", () => {
    const required = requiredLongSideForPrint({
      ...photo,
      box_width: a3_width,
      box_height: a3_width / 1.5,
      dpi: 300,
    });
    expect(required).toBe(3508);
  });

  it("is fine with a 2000px thumb for an 8cm wide image at 300dpi", () => {
    const box_width = (80 / 25.4) * 96;
    const required = requiredLongSideForPrint({
      ...photo,
      box_width,
      box_height: box_width / 1.5,
      dpi: 300,
    });
    expect(required).toBe(945);
  });

  it("halves the requirement at 150dpi", () => {
    const required = requiredLongSideForPrint({
      ...photo,
      box_width: a3_width,
      box_height: a3_width / 1.5,
      dpi: 150,
    });
    expect(required).toBe(1754);
  });

  it("uses the covering scale for object-fit cover", () => {
    // square box on a 3:2 image: height drives the scale
    const required = requiredLongSideForPrint({
      natural_width: 6000,
      natural_height: 4000,
      box_width: 400,
      box_height: 400,
      object_fit: "cover",
      dpi: 96,
    });
    expect(required).toBe(600);
  });

  it("uses the fitting scale for object-fit contain", () => {
    const required = requiredLongSideForPrint({
      natural_width: 6000,
      natural_height: 4000,
      box_width: 400,
      box_height: 400,
      object_fit: "contain",
      dpi: 96,
    });
    expect(required).toBe(400);
  });

  it("returns 0 when sizes are unknown", () => {
    expect(
      requiredLongSideForPrint({
        natural_width: 0,
        natural_height: 0,
        box_width: 100,
        box_height: 100,
        dpi: 300,
      })
    ).toBe(0);
  });
});

describe("pickSourceForPrint", () => {
  const sources = [
    { size: 50, url: "/thumbs/a.jpg.50.jpeg" },
    { size: 220, url: "/thumbs/a.jpg.220.jpeg" },
    { size: 440, url: "/thumbs/a.jpg.440.jpeg" },
    { size: 1600, url: "/thumbs/a.jpg.1600.jpeg" },
    { size: 4000, url: "/a.jpg" },
  ];

  it("picks the smallest thumb large enough", () => {
    // 3000×4000 source printed ~500px wide at 300dpi needs a 667px long side
    expect(pickSourceForPrint(sources, 667).url).toBe(
      "/thumbs/a.jpg.1600.jpeg"
    );
    expect(pickSourceForPrint(sources, 440).url).toBe("/thumbs/a.jpg.440.jpeg");
  });

  it("falls back to the source file when no thumb is large enough", () => {
    expect(pickSourceForPrint(sources, 2500).url).toBe("/a.jpg");
    expect(pickSourceForPrint(sources, 9000).url).toBe("/a.jpg");
  });
});

describe("imageSourceAttributes", () => {
  it("only sets src when there are no other sizes", () => {
    expect(imageSourceAttributes({ src: "/a.jpg" })).toBe('src="/a.jpg"');
  });

  it("lists the available sizes, escaped for an attribute", () => {
    expect(
      imageSourceAttributes({
        src: "/thumbs/a.jpg.1600.jpeg",
        sources: [
          { size: 1600, url: "/thumbs/a.jpg.1600.jpeg?v=1&b" },
          { size: 4000, url: "/a.jpg" },
        ],
      })
    ).toBe(
      'src="/thumbs/a.jpg.1600.jpeg" data-print-sources="[{&quot;size&quot;:1600,&quot;url&quot;:&quot;/thumbs/a.jpg.1600.jpeg?v=1&amp;b&quot;},{&quot;size&quot;:4000,&quot;url&quot;:&quot;/a.jpg&quot;}]"'
    );
  });
});
