<template>
  <div
    class="quillWrapper"
    autocorrect="off"
    autofocus="autofocus"
    :class="{
      'is--read_only': read_only,
      'is--focused': is_focused,
      'has--noToolbar': specific_toolbar && specific_toolbar.length === 0,
    }"
  >
    <!-- connection_state : {{ connection_state }}
    <br />-->

    <!-- {{ other_clients_editing }} -->

    <div ref="editor" class="mediaTextContent" />
    <!-- <ClientsCheckingOut
      :type="'projects'"
      :slugFolderName="slugFolderName"
      :metaFileName="media.metaFileName"
    /> -->

    <transition name="fade" :duration="600">
      <div
        class="quillWrapper--savingIndicator"
        v-if="enable_collaboration && (is_loading_or_saving || show_saved_icon)"
      >
        <transition name="fade" :duration="600">
          <template v-if="is_loading_or_saving">
            <span class="loader loader-small" />
          </template>
          <template v-else-if="show_saved_icon">
            <span>✓</span>
          </template>
        </transition>
      </div>
    </transition>
  </div>
</template>
<script>
import ClientsCheckingOut from "./ClientsCheckingOut.vue";

import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import debounce from "debounce";
import katex from "katex";
window.katex = katex;

Quill.register("modules/cursors", QuillCursors);
ShareDB.types.register(require("rich-text").type);

var fonts = [
  "",
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
  "Krub",
  "OpenDyslexic",
];
var FontAttributor = Quill.import("attributors/style/font");
FontAttributor.whitelist = fonts;
Quill.register(FontAttributor, true);

var Size = Quill.import("attributors/style/size");
Size.whitelist = ["75%", "18px", "150%", "300%"];
Quill.register(Size, true);

var BlockEmbed = Quill.import("blots/block/embed");

class DividerBlot extends BlockEmbed {}
DividerBlot.blotName = "divider";
DividerBlot.tagName = "hr";
Quill.register(DividerBlot);

export default {
  props: {
    value: {
      type: String,
      default: "…",
    },
    type: String,
    slugFolderName: String,
    media: Object,
    specific_toolbar: Array,
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
    show_cursors: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    ClientsCheckingOut,
  },
  data() {
    return {
      editor: null,
      doc: undefined,
      editor_id: (Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      ),

      is_loading_or_saving: false,
      show_saved_icon: false,
      cursors: [],
      local_other_clients_editing: [],

      custom_toolbar: [
        [{ font: fonts }],
        [{ header: [false, 1, 2, 3] }],
        [{ size: ["75%", false, "150%", "300%"] }], // [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }, { 'header': 4 }],
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
        ["formula"],
        ["divider"],
        ["clean"],
      ],

      formats: [
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
        "formula",
        "divider",
        "video",
      ],

      is_focused: false,

      debounce_textUpdate: undefined,

      socket: null,
      connection_state: !this.enable_collaboration ? "disabled" : "connecting…",
      requested_resource_url: undefined,
    };
  },

  created() {},
  mounted() {
    this.is_loading_or_saving = true;

    const toolbar_options = this.specific_toolbar
      ? this.specific_toolbar
      : this.custom_toolbar;

    if (toolbar_options.length === 0) {
      this.formats = [];
    }

    this.editor = new Quill(this.$refs.editor, {
      modules: {
        toolbar: {
          container: toolbar_options,
          handlers: {
            divider: () => {
              var range = this.editor.getSelection();
              if (range) {
                this.editor.insertEmbed(
                  range.index,
                  "divider",
                  "null",
                  Quill.sources.USER
                );
              }
            },
          },
        },
        formula: true,
        cursors: {
          template: `
            <span class="ql-cursor-selections"></span>
            <span class="ql-cursor-caret-container">
              <span class="ql-cursor-caret"></span>
            </span>
            <div class="ql-cursor-flag">
              <small class="ql-cursor-name"></small>
            </div>
          `,
          hideDelayMs: 5000,
          hideSpeedMs: 0,
          // selectionChangeSource: null,
          transformOnTextChange: true,
        },
      },
      bounds: this.$refs.editor,
      theme: this.theme,
      formats: this.formats,
      placeholder: "…",
    });

    this.$refs.editor.dataset.quill = this.editor;

    if (this.show_cursors) this.cursors = this.editor.getModule("cursors");

    if (this.read_only || this.$root.state.mode !== "live")
      this.editor.disable();

    if (!this.read_only && this.$root.state.mode === "live") {
      const name = this.$root.current_author
        ? this.$root.current_author.name
        : this.$t("anonymous");

      if (this.show_cursors) {
        this.cursors.createCursor("_self", name, "#1d327f");
        this.cursors.toggleFlag("_self", false);
      }
    }

    this.$nextTick(() => {
      this.editor.root.innerHTML = this.value;

      this.is_loading_or_saving = false;

      if (this.$root.state.mode === "live") {
        this.editor.focus();
        this.$nextTick(() => {
          this.editor.setSelection(this.editor.getLength(), 0, "api");
        });
      }
      if (
        this.$root.state.mode === "live" &&
        this.enable_collaboration &&
        !this.read_only
      ) {
        this.initWebsocketMode();
      }

      this.editor.on("text-change", (delta, oldDelta, source) => {
        if (this.read_only) return;

        if (source !== "init") this.$emit("input", this.sanitizeEditorHTML());

        this.$nextTick(() => {
          this.updateFocusedLines();
        });

        // const range = this.editor.getSelection();
        // this.cursors.moveCursor("_self", range);
        // this.updateCaretPositionForClient(range);
      });

      this.editor.on("selection-change", (range, oldRange, source) => {
        console.log("selection changed");
        if (range === null && oldRange !== null) this.is_focused = false;
        else if (range !== null && oldRange === null) this.is_focused = true;

        if (this.enable_collaboration)
          this.$nextTick(() => {
            this.updateCaretPositionForClient(range);
          });

        this.updateFocusedLines();
      });
    });
  },
  beforeDestroy() {
    if (!!this.socket) {
      this.socket.close();
    }
    if (this.enable_collaboration) {
      this.removeCaretPosition();
    }
  },
  watch: {
    read_only() {
      if (this.read_only) this.editor.disable();
      else this.editor.enable();
    },
    other_clients_editing() {
      // compare other_clients_editing with cursors

      if (this.show_cursors) {
        const cursors = this.cursors.cursors();

        this.other_clients_editing.map(({ name, index, length }) => {
          // check if client has cursor locally
          if (!cursors.find((cursor) => cursor.id === name)) {
            const color = this.getColorFromName(name);

            if (this.show_cursors) {
              this.cursors.createCursor(name, name, color);
              this.cursors.moveCursor(name, { index, length });
              this.cursors.toggleFlag(name);
            }
          } else {
            // detect changes, only update for client whose index or length changed
            if (
              this.local_other_clients_editing.find(
                (local_client) =>
                  local_client.name === name &&
                  (local_client.index !== index ||
                    local_client.length !== length)
              )
            ) {
              if (this.show_cursors)
                this.cursors.moveCursor(name, { index, length });
            }
          }
        });

        cursors.map((cursor) => {
          if (
            cursor.id !== "_self" &&
            !this.other_clients_editing.find(
              (client) => client.name === cursor.id
            )
          ) {
            if (this.show_cursors) this.cursors.removeCursor(cursor.id);
          }
        });
      }

      this.local_other_clients_editing = JSON.parse(
        JSON.stringify(this.other_clients_editing)
      );
    },
  },
  computed: {
    reference_to_media() {
      return `${this.type}/${this.slugFolderName}/${this.media.metaFileName}`;
    },
    other_clients_editing() {
      if (
        !this.type ||
        !this.slugFolderName ||
        !this.media ||
        !this.media.metaFileName
      )
        return false;

      return this.$root.unique_clients.reduce((acc, c) => {
        if (
          c.data &&
          c.data.caret_information &&
          c.data.caret_information.path === this.reference_to_media &&
          c.data.caret_information.range.index
        ) {
          let name = this.$t("anonymous");
          name += ` "${c.id}"`;
          if (
            c.data.author &&
            c.data.author.slugFolderName &&
            this.$root.getAuthor(c.data.author.slugFolderName)
          ) {
            name = this.$root.getAuthor(c.data.author.slugFolderName).name;
          }

          acc.push({
            name,
            index: c.data.caret_information.range.index,
            length: c.data.caret_information.range.length,
          });
        }
        return acc;
      }, []);
    },
  },
  methods: {
    getColorFromName(name) {
      const colors = this.custom_toolbar[4][0].color;

      // if (name === this.$t("anonymous")) {
      //   return colors[Math.floor(Math.random() * colors.length)];
      // }

      return colors[parseInt(name, 36) % colors.length];
    },
    sanitizeEditorHTML() {
      // used to make sure we don’t get weird stuff such as <p style="font-family: "Avada";">plop</p>
      if (!this.editor.getText() || this.editor.getText() === "\n") return "";

      let content = this.editor.root.innerHTML;
      content = content.replace(/&quot;/g, "'");

      return content;
    },
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
          this.editor.setContents(doc.data, "init");
        }

        this.editor.history.clear();
        this.editor.setSelection(this.editor.getLength(), 0, "api");
        // this.$emit("input", this.sanitizeEditorHTML());

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
    updateCaretPositionForClient(range) {
      if (this.read_only) return;

      if (this.show_cursors) this.cursors.moveCursor("_self", range);
      this.$root.updateClientInfo({
        caret_information: {
          path: this.reference_to_media,
          range,
        },
      });
    },
    removeCaretPosition() {
      if (this.show_cursors) this.cursors.removeCursor("_self");
      this.$root.updateClientInfo({
        caret_information: {},
      });
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
      this.is_loading_or_saving = true;

      this.debounce_textUpdate = setTimeout(() => {
        console.log(
          `CollaborativeEditor • updateTextMedia: saving new snapshop`
        );

        this.$root
          .editMedia({
            type: this.type,
            slugFolderName: this.slugFolderName,
            slugMediaName: this.media.metaFileName,
            data: {
              content: this.sanitizeEditorHTML(),
            },
          })
          .then((mdata) => {
            this.is_loading_or_saving = false;
            this.show_saved_icon = true;
            setTimeout(() => {
              this.show_saved_icon = false;
            }, 200);
          });
      }, 1000);
    },
  },
};
</script>
