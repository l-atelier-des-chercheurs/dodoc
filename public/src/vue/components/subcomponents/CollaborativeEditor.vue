<template>
  <div class="quillWrapper" autocorrect="off" autofocus="autofocus">
    <!-- connection_state : {{ connection_state }}<br> -->
    <div ref="editor" class="mediaTextContent" />
  </div>
</template>
<script>
import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";

ShareDB.types.register(require("rich-text").type);

var FontAttributor = Quill.import("attributors/style/font");
FontAttributor.whitelist = ["roboto", "inconsolata"];
Quill.register(FontAttributor, true);

var Size = Quill.import("attributors/style/size");
Size.whitelist = ["50%", "18px", "150%", "300%"];
Quill.register(Size, true);

export default {
  props: {
    value: {
      type: String,
      default: "…",
    },
    media: Object,
    slugFolderName: String,
    theme: {
      type: String,
      default: "snow",
    },
  },
  components: {},
  data() {
    return {
      editor: null,
      editor_id: (Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      ),

      custom_toolbar: [
        [{ header: [false, 1, 2, 3] }],
        [{ size: ["50%", false, "150%", "300%"] }], // [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }, { 'header': 4 }],
        ["bold", "italic", "underline", "link", "blockquote"],
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
        ["clean"],
      ],

      socket: null,
      connection_state: undefined,
      requested_resource_url: undefined,
    };
  },

  created() {},
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      modules: {
        toolbar: this.custom_toolbar,
      },
      bounds: this.$refs.editor,
      theme: this.theme,
      formats: [
        "bold",
        "size",
        "italic",
        "underline",
        "link",
        "header",
        "blockquote",
        "list",
        "color",
        "background",
      ],
    });

    this.editor.root.innerHTML = this.value;

    this.$nextTick(() => {
      // this.initWebsocketMode();

      this.editor.on("text-change", (delta, oldDelta, source) => {
        this.$emit(
          "input",
          this.editor.getText() ? this.editor.root.innerHTML : ""
        );
      });
    });
  },
  beforeDestroy() {
    if (!!this.socket) {
      this.socket.close();
    }
  },
  watch: {},
  computed: {},
  methods: {
    initWebsocketMode() {
      const params = new URLSearchParams({
        type: "projects",
        slugFolderName: this.slugFolderName,
        metaFileName: this.media.metaFileName,
      });

      const requested_querystring = "?" + params.toString();
      this.requested_resource_url =
        (location.protocol === "https:" ? "wss" : "ws") +
        "://" +
        window.location.host +
        "/sharedb" +
        requested_querystring;

      console.log(
        `MOUNTED • CollaborativeEditor: will connect to ws server with ${this.requested_resource_url}`
      );

      this.socket = new ReconnectingWebSocket(this.requested_resource_url);
      const connection = new ShareDB.Connection(this.socket);
      connection.on("state", this.wsState);

      const doc = connection.get("textMedias", requested_querystring);

      doc.subscribe((err) => {
        if (err) {
          console.error(`ON • CollaborativeEditor: err ${err}`);
        }
        console.log(`ON • CollaborativeEditor: subscribe`);

        if (!doc.type) {
          console.log(
            `ON • CollaborativeEditor: no type found on doc, creating a new one with content ${JSON.stringify(
              this.editor.getContents()
            )}`
          );
          doc.create(this.editor.getContents(), "rich-text");
        } else {
          console.log(
            `ON • CollaborativeEditor: doc already exists and doc.data = ${JSON.stringify(
              doc.data,
              null,
              4
            )}`
          );
          this.editor.setContents(doc.data);
          this.$emit(
            "input",
            this.editor.getText() ? this.editor.root.innerHTML : ""
          );
        }

        this.editor.on("text-change", (delta, oldDelta, source) => {
          if (source == "user") {
            console.log(`ON • CollaborativeEditor: text-change by user`);
            doc.submitOp(delta, { source: this.editor_id });
          } else {
            console.log(`ON • CollaborativeEditor: text-change by API`);
          }
        });

        doc.on("op", (op, source) => {
          if (source === this.editor_id) return;
          console.log(`ON • CollaborativeEditor: operation applied to quill`);
          this.editor.updateContents(op);
        });
      });
    },
    wsState(state, reason) {
      console.log(
        `METHODS • CollaborativeEditor: wsState with state = ${state} and reason = ${reason}`
      );
      this.connection_state = state.toString();
      // 'connecting' 'connected' 'disconnected' 'closed' 'stopped'
    },
  },
};
</script>
<style lang="scss">
.quillWrapper .ql-toolbar {
  border-bottom-width: 2px;
  background-color: var(--c-gris-clair);

  display: flex;
  flex-flow: row wrap;
  align-items: center;

  // overflow-x: auto;
  overflow-y: visible;
}

.ql-toolbar::before {
  // content: "options";
  position: relative;
  display: block;

  margin: 0;
  // margin-top: 4px;
  padding: 4px;
  font-weight: 700;
  font-family: "Fira Code";
  text-decoration: underline;
  font-size: 0.8rem;
}

.ql-formats {
  display: flex;
  flex-flow: row nowrap;

  border: 2px solid var(--c-gris-clair);
  border-radius: 12px;
  padding: 0.4rem;
  background: white;
}

.ql-picker.ql-header {
  width: 115px !important;
}

html[lang="fr"] .ql-picker.ql-header .ql-picker-label::before,
html[lang="fr"] .ql-picker.ql-header .ql-picker-item::before {
  content: "Texte courant";
}
html[lang="en"] .ql-picker.ql-header .ql-picker-label::before,
html[lang="en"] .ql-picker.ql-header .ql-picker-item::before {
  content: "Regular text";
}
html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "Titre 1";
}
html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "Titre 2";
}
html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "Titre 3";
}
html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "Titre 4";
}

.ql-picker.ql-size .ql-picker-item[data-value="50%"]::before {
  content: "Small";
  font-size: 70% !important;

  html[lang="fr"] & {
    content: "Petit";
  }
}
.ql-picker.ql-size .ql-picker-item:not([data-value])::before {
  content: "Regular";
  font-size: 18px !important;

  html[lang="fr"] & {
    content: "Normal";
  }
}
.ql-picker.ql-size .ql-picker-item[data-value="150%"]::before {
  content: "Large";
  font-size: 150% !important;

  html[lang="fr"] & {
    content: "Grand";
  }
}
.ql-picker.ql-size .ql-picker-item[data-value="300%"]::before {
  content: "Huge";
  font-size: 300% !important;

  html[lang="fr"] & {
    content: "Énorme";
  }
}

.ql-font-roboto {
  font-family: "Roboto", sans-serif;
}
</style>
