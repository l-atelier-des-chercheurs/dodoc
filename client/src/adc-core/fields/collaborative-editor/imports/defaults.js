import Quill from "quill";

export const fonts = [
  "Fira Sans",
  "Luciole",
  "Belle Allure CE",
  "Belle Allure CM",
  "OpenDyslexic",
  "Alegreya",
  "Roboto Mono",
  "Roboto",
  "Source Sans Pro",
  "Source Serif Pro",
  "PT Serif",
  "Work Sans",
  "Karla",
  "IBM Plex Serif",
  "IBM Plex Sans",
  "Raleway",
  "Volkhov",
  "Archivo",
  "Spectral",
  "Krub",
];

export const fontSizeArr = [
  "8px",
  "9px",
  "10px",
  "12px",
  "14px",
  false,
  "20px",
  "24px",
  "32px",
  "42px",
  "54px",
  "68px",
  "84px",
  "98px",
];
export const lineHeightArr = [
  "0.6",
  "0.8",
  "1",
  "1.2",
  false,
  "1.6",
  "1.8",
  "2",
];

export const toolbar = {
  container: [
    [
      {
        font: fonts,
      },
    ],
    [{ header: [false, 1, 2, 3] }],
    [{ size: fontSizeArr }],
    [{ lineheight: lineHeightArr }],
    ["bold", "italic", "underline", "strike", "link", "blockquote"],
    [
      {
        color: [
          "#000000",
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
    // ["divider"],
    ["clean"],
    // ["status"],
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
    line_height_select: function (new_line_height) {
      debugger;
      new_line_height;
      // var range = this.quill.getSelection();
      // if (range) {
      //   debugger;
      //   this.quill.format(
      //     range.index,
      //     range.length,
      //     "line-height",
      //     +new_line_height,
      //     "user"
      //   );
      // }
    },
  },
};

export const formats = [
  "bold",
  "size",
  "lineheight",
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
