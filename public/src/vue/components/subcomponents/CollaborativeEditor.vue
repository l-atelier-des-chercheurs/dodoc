<template>
  <div
    class="quillWrapper"
    autocorrect="off"
    autofocus="autofocus"
    :class="{
      'is--read_only': read_only,
      'is--focused': is_focused,
    }"
  >
    <!-- connection_state : {{ connection_state }}
    <br />-->
    <div ref="editor" class="mediaTextContent" />
    <!-- <div class="_customCaret" :style="_customCaret_style" /> -->
  </div>
</template>
<script>
import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import debounce from "debounce";

Quill.register("modules/cursors", QuillCursors);
ShareDB.types.register(require("rich-text").type);

var fonts = ["", "Alegreya", "Roboto Mono"];
var FontAttributor = Quill.import("attributors/style/font");
FontAttributor.whitelist = fonts;
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
    read_only: {
      type: Boolean,
      default: false,
    },
    enable_collaboration: {
      type: Boolean,
      default: false,
    },
    type: String,
  },
  components: {},
  data() {
    return {
      editor: null,
      doc: undefined,
      editor_id: (Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      ),

      custom_toolbar: [
        [{ font: fonts }],
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
        [
          { align: "" },
          { align: "center" },
          { align: "right" },
          { align: "justify" },
        ],
        ["code-block"],
        ["clean"],
      ],

      is_focused: false,

      debounce_textUpdate: undefined,
      caret_position: {
        top: undefined,
        left: undefined,
      },

      socket: null,
      connection_state: !this.enable_collaboration ? "disabled" : "connecting…",
      requested_resource_url: undefined,
    };
  },

  created() {},
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      modules: {
        toolbar: this.custom_toolbar,
        cursors: {
          template: `
    <span class="ql-cursor-caret-container">
    <span class="ql-cursor-selections"></span>
      <span class="ql-cursor-caret"></span>
    </span>
    <div class="ql-cursor-flag">
      <small class="ql-cursor-name"></small>
      <span class="ql-cursor-flag-flap"></span>
    </div>
`,
          hideDelayMs: 5000,
          hideSpeedMs: 0,
          selectionChangeSource: null,
        },
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
        "font",
        "align",
        "code-block",
      ],
      placeholder: "…",
    });

    this.$refs.editor.dataset.quill = this.editor;

    if (this.read_only || this.$root.state.mode !== "live")
      this.editor.disable();

    // const cursorsOne = this.editor.getModule("cursors");
    // cursorsOne.createCursor(1, "User 1", "#0a997f");

    this.$nextTick(() => {
      this.editor.root.innerHTML = this.value;

      if (this.$root.state.mode === "live" && this.enable_collaboration) {
        this.initWebsocketMode();
        this.editor.focus();
      } else {
      }

      this.editor.on("text-change", (delta, oldDelta, source) => {
        if (this.read_only) return;

        this.$emit(
          "input",
          this.editor.getText() ? this.editor.root.innerHTML : ""
        );

        this.$nextTick(() => {
          this.updateFocusedLines();
        });

        // cursorsOne.moveCursor(1, range);
      });

      this.editor.on("selection-change", (range, oldRange, source) => {
        console.log("selection changed");
        if (range === null && oldRange !== null) this.is_focused = false;
        else if (range !== null && oldRange === null) this.is_focused = true;

        // cursorsOne.moveCursor(1, range);
        if (!!range && range.length == 0) {
          console.log("User cursor is on", range.index);
          this.updateCaretPosition();
        }

        this.updateFocusedLines();
      });
    });
  },
  beforeDestroy() {
    if (!!this.socket) {
      this.socket.close();
    }
  },
  watch: {
    read_only() {
      if (this.read_only) this.editor.disable();
      else this.editor.enable();
    },
  },
  computed: {
    _customCaret_style() {
      return {
        transform: `translate3d(${this.caret_position.left}px, ${this.caret_position.top}px, 0px)`,
      };
    },
  },
  methods: {
    initWebsocketMode() {
      console.log(`CollaborativeEditor / initWebsocketMode`);
      const params = new URLSearchParams({
        type: this.type,
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
        `CollaborativeEditor / initWebsocketMode : will connect to ws server with ${this.requested_resource_url}`
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
          this.editor.root.innerHTML = this.value;
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
        }

        this.$emit(
          "input",
          this.editor.getText() ? this.editor.root.innerHTML : ""
        );

        this.editor.on("text-change", (delta, oldDelta, source) => {
          if (source == "user") {
            console.log(`ON • CollaborativeEditor: text-change by user`);
            doc.submitOp(delta, { source: this.editor_id });

            this.updateTextMedia();
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

      doc.on("error", (err) => {
        // soucis : les situations ou le serveur a été fermé et en le rouvrant il ne possède plus d’instance du doc dans sharedb…
        this.$forceUpdate();
      });
    },
    updateCaretPosition() {
      console.log(`CollaborativeEditor • METHODS: updateCaretPosition`);
      var selection = this.editor.getSelection(true);
      const caretPos = this.editor.getBounds(selection);
      this.caret_position = { top: caretPos.top, left: caretPos.left };
    },
    updateFocusedLines() {
      console.log(`CollaborativeEditor • METHODS: updateFocusedLines`);

      // if (oldRange && oldRange.index) {
      //   const line = this.editor.getLine(oldRange.index);
      //   if (line) {
      //     line[0].domNode.classList.remove("is--focused");
      //   }
      // }

      this.editor
        .getLines()
        .map((b) => b.domNode.classList.remove("is--focused"));

      const range = this.editor.getSelection();

      if (range && range.index) {
        const line = this.editor.getLine(range.index);
        if (line) {
          line[0].domNode.classList.add("is--focused");
        }
      }
    },
    wsState(state, reason) {
      console.log(
        `METHODS • CollaborativeEditor: wsState with state = ${state} and reason = ${reason}`
      );
      this.connection_state = state.toString();
      // 'connecting' 'connected' 'disconnected' 'closed' 'stopped'
    },
    updateTextMedia(event) {
      if (this.debounce_textUpdate) clearTimeout(this.debounce_textUpdate);
      this.debounce_textUpdate = setTimeout(() => {
        console.log(
          `CollaborativeEditor • updateTextMedia: saving new snapshop`
        );

        this.$root.editMedia({
          type: this.type,
          slugFolderName: this.slugFolderName,
          slugMediaName: this.media.metaFileName,
          data: {
            content: this.editor.getText() ? this.editor.root.innerHTML : "",
          },
        });
      }, 1000);
    },
  },
};
</script>
