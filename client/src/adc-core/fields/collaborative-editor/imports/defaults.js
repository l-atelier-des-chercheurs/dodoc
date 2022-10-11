import Quill from "quill";

export const fonts = [
  "IBM Plex Sans",
  "Alegreya",
  "Roboto Mono",
  "Roboto",
  "Source Sans Pro",
  "Source Serif Pro",
  "PT Serif",
  "Work Sans",
  "Karla",
  "IBM Plex Serif",
  "Volkhov",
  "Archivo Black",
  "Spectral",
];

export const toolbar = {
  container: [
    [
      {
        font: fonts,
      },
    ],
    [{ header: [false, 1, 2, 3] }],
    // [{ size: ["75%", false, "150%", "300%"] }],
    ["bold", "italic", "underline", "strike", "link", "blockquote"],
    [
      {
        color: [
          "#353535",
          "#b9b9b9",
          "#fff",
          "#1d327f",
          "#52c5b9",
          "#ffbe32",
          "#fc4b60",

          "#ff3333",
          "#08cc11",
          "#1c52ee",
          "#ff9c33",
          "#000000",
          "#bdb3b3",
          "#ae1cee",
          "#fff933",
          "#a54a0f",
        ],
      },
    ],
    [
      {
        background: [
          "transparent",
          "#f1f1f1",
          "#b9b9b9",
          "#bec6e5",
          "#a5e5da",
          "#ffd892",
          "#ff808c",

          "#ff3333",
          "#08cc11",
          "#1c52ee",
          "#ff9c33",
          "#000000",
          "#bdb3b3",
          "#ae1cee",
          "#fff933",
          "#a54a0f",
        ],
      },
    ],
    [{ list: "ordered" }, { list: "bullet" }],
    [
      { align: "" },
      { align: "center" },
      { align: "right" },
      { align: "justify" },
    ],
    ["code-block"],
    ["divider"],
    ["clean"],
    ["status"],
  ],
  handlers: {
    divider: function () {
      var range = this.quill.getSelection();
      if (range) {
        this.quill.insertEmbed(
          range.index,
          "divider",
          "null",
          Quill.sources.USER
        );
      }
    },
  },
};

export const formats = [
  "bold",
  "size",
  "italic",
  "underline",
  "strike",
  "link",
  "header",
  "blockquote",
  "list",
  "color",
  "background",
  "font",
  "align",
  "code-block",
  "divider",
  "video",
  "media",
];
