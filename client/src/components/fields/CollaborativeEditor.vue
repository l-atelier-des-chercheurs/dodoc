<template>
  <div
    class="m_collaborativeEditor quillWrapper"
    autocorrect="off"
    autofocus="autofocus"
    :class="{
      'is--focused': is_focused,
      'is--read_only': read_only,
      'is--receptiveToDrop': !!$root.settings.media_being_dragged,
      'is--dragover': is_being_dragover,
      'is--disabled': editor_not_enabled,
      'has--noToolbar': specific_toolbar && specific_toolbar.length === 0,
    }"
    @dragover="ondragover($event)"
    @drop="ondrop($event)"
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
// import ClientsCheckingOut from "./ClientsCheckingOut.vue";

import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";
// import QuillCursors from "quill-cursors";
import debounce from "debounce";

import MediaBlot from "./quill/MediaBlot";
import CardEditableModule from "./quill/CardEditableModule";

Quill.register("formats/media", MediaBlot);
Quill.register("modules/cardEditable", CardEditableModule);

// Quill.register("modules/cursors", QuillCursors);
ShareDB.types.register(require("rich-text").type);

// eslint-disable-next-line no-unused-vars
var quill_kb_bindings = {
  // This will overwrite the default binding also named 'tab'
  // tab: {
  //   key: 9,
  //   handler: function() {
  //     // Handle tab
  //   }
  // },

  // There is no default binding named 'custom'
  // so this will be added without overwriting anything
  backspace: {
    key: 8,
    handler: function (range) {
      if (
        range.index &&
        this.quill.getLine(range.index) &&
        this.quill.getLine(range.index)[0].domNode.dataset &&
        this.quill.getLine(range.index)[0].domNode.dataset.metaFileName
      ) {
        //
      }
      return true;
    },
  },
  // list: {
  //   key: "backspace",
  //   format: ["list"],
  //   handler: function(range, context) {
  //     if (context.offset === 0) {
  //       // When backspace on the first character of a list,
  //       // remove the list instead
  //       this.quill.format("list", false, Quill.sources.USER);
  //     } else {
  //       // Otherwise propogate to Quill's default
  //       return true;
  //     }
  //   }
  // }
};

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
    type: {
      type: String,
      default: "projects",
    },
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
    // ClientsCheckingOut,
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
        "divider",
        "video",
        "media",
      ],

      is_focused: false,
      is_being_dragover: false,
      is_being_dragover_on_blot: false,

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
        cardEditable: true,
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
        keyboard: {
          // bindings: quill_kb_bindings,
        },
      },
      bounds: this.$refs.editor,
      theme: this.theme,
      formats: this.formats,
      placeholder: "…",
    });

    this.$refs.editor.dataset.quill = this.editor;

    this.cancelDragOver = debounce(this.cancelDragOver, 300);

    if (this.show_cursors) this.cursors = this.editor.getModule("cursors");

    if (this.read_only || this.$root.state.mode !== "live")
      this.editor.disable();

    if (!this.read_only && this.$root.state.mode === "live") {
      const name = this.$root.current_author
        ? this.$root.current_author.name
        : this.$t("anonymous_user");

      if (this.show_cursors) {
        this.cursors.createCursor("_self", name, "#1d327f");
        this.cursors.toggleFlag("_self", false);
      }
    }

    this.$nextTick(() => {
      let content = this.value;

      if (this.$root.state.mode === "export_planning") {
        var el = document.createElement("html");
        el.innerHTML = content;
        el.querySelectorAll("[src]").forEach(function (item) {
          item.setAttribute("src", "/" + item.getAttribute("src"));
        });
        content = el.innerHTML;
      }

      this.editor.root.innerHTML = content;

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
        source;
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
    this.$eventHub.$on("writeup.addMedia", this.addMediaAtTheEnd);
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
    }

    this.$eventHub.$off("writeup.addMedia", this.addMediaAtTheEnd);

    this.$root.settings.medias_present_in_writeup = [];

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
      connection.on("state", (state, reason) => {
        reason;
        this.connection_state = state.toString();
      });

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
          if (source === "user") {
            console.log(`ON • CollaborativeEditor: text-change by user`);
            doc.submitOp(delta, { source: this.editor_id });

            this.updateTextMedia();
          } else {
            console.log(`ON • CollaborativeEditor: text-change by API`);
          }
        });

        this.broadcastMediasPresentInWriteup();

        doc.on("op", (op, source) => {
          if (source === this.editor_id) return;
          console.log(`ON • CollaborativeEditor: operation applied to quill`);
          this.editor.updateContents(op);
        });
      });

      doc.on("error", () => {
        // err;
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
    updateTextMedia() {
      if (this.debounce_textUpdate) clearTimeout(this.debounce_textUpdate);
      this.is_loading_or_saving = true;

      this.debounce_textUpdate = setTimeout(() => {
        console.log(
          `CollaborativeEditor • updateTextMedia: saving new snapshop`
        );

        this.broadcastMediasPresentInWriteup();

        this.$root
          .editMedia({
            type: this.type,
            slugFolderName: this.slugFolderName,
            slugMediaName: this.media.metaFileName,
            data: {
              content: this.sanitizeEditorHTML(),
            },
          })
          .then(() => {
            this.is_loading_or_saving = false;
            this.show_saved_icon = true;
            setTimeout(() => {
              this.show_saved_icon = false;
            }, 200);
          });
      }, 1000);
    },

    broadcastMediasPresentInWriteup() {
      console.log(`CollaborativeEditor • broadcastMediasPresentInWriteup`);

      // var t0 = performance.now();
      const _medias_present = this.editor.getLines().reduce((acc, _blot) => {
        if (_blot.domNode.dataset && _blot.domNode.dataset.metaFileName) {
          if (!acc.includes(_blot.domNode.dataset.metaFileName)) {
            acc.push(_blot.domNode.dataset.metaFileName);
          }
        }
        return acc;
      }, []);

      // var t1 = performance.now();
      // console.log(
      //   "L'appel à faire quelqueChose a pris " + (t1 - t0) + " millisecondes."
      // );

      this.$root.settings.medias_present_in_writeup = _medias_present;
    },

    addMediaAtTheEnd(media) {
      this.addMediaAtIndex(this.editor.getLength() - 1, media);
    },
    addMediaAtCaretPosition(media) {
      var selection = this.editor.getSelection(true);
      if (
        selection &&
        Object.prototype.hasOwnProperty.call(selection, "index")
      ) {
        this.addMediaAtIndex(selection.index, media);
        return;
      }
      this.addMediaAtTheEnd(media);
    },
    addMediaAtIndex(index, media) {
      console.log(`CollaborativeEditor • addMediaAtIndex ${index}`);
      const mediaURL =
        this.$root.state.mode === "export_publication"
          ? `./${this.slugFolderName}/${media.media_filename}`
          : `/${this.slugFolderName}/${media.media_filename}`;

      // setting editor focus and selection can cause the scroll to "jump"
      // not exactly a good idea…
      // this.editor.setSelection(index, Quill.sources.SILENT);
      // this.editor.focus();

      this.editor.blur();

      if (media.type === "image") {
        const thumb = media.$thumbs.find((m) => m.size === 1600);
        if (thumb) {
          // this.editor.insertText(index, "\n", Quill.sources.USER);
          this.editor.insertEmbed(
            index,
            "media",
            {
              type: media.type,
              caption: media.caption,
              src: thumb.path,
              metaFileName: media.metaFileName,
            },
            Quill.sources.USER
          );
          // this.editor.setSelection(index + 1, Quill.sources.SILENT);
        }
      } else if (media.type === "video") {
        // this.editor.insertText(index, "\n", Quill.sources.USER);
        this.editor.insertEmbed(
          index,
          "media",
          {
            type: media.type,
            caption: media.caption,
            src: mediaURL,
            metaFileName: media.metaFileName,
          },
          Quill.sources.USER
        );
        // this.editor.setSelection(index + 1, Quill.sources.SILENT);
      } else if (media.type === "audio") {
        this.editor.insertEmbed(
          index,
          "media",
          {
            type: media.type,
            caption: media.caption,
            src: mediaURL,
            metaFileName: media.metaFileName,
          },
          Quill.sources.USER
        );
      } else {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.media_type_not_handled"));
      }
    },

    ondragover($event) {
      console.log(
        `METHODS • CollaborativeEditor / dragover on ${$event.currentTarget.className}`
      );
      this.is_being_dragover = true;

      this.removeDragoverFromBlots();
      // this.removeFocusFromBlots();

      const _blot = this.getBlockFromElement($event.target);
      if (_blot) _blot.domNode.classList.add("is--dragover");

      this.cancelDragOver();
    },
    cancelDragOver() {
      if (this.$root.debug_mode === "debug") {
        console.log(`METHODS • CollaborativeEditor / cancelDragOver`);
      }
      this.removeDragoverFromBlots();
      this.is_being_dragover = false;
    },

    ondrop($event) {
      console.log(`METHODS • CollaborativeEditor / ondrop`);

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "move";

      this.removeDragoverFromBlots();

      if ($event.dataTransfer.getData("text/plain") === "media_in_quill") {
        console.log(
          `METHODS • CollaborativeEditor / ondrop: drag and dropped a media from quill`
        );
        let _blot = this.getBlockFromElement($event.target);
        const index = this.editor.getIndex(_blot);

        // find which blot was dragged (A)

        // find where it was dropped (B)

        // move delta from A to B

        console.log(`_blot is currently at index ${index}`);
      } else if ($event.dataTransfer.getData("text/plain")) {
        console.log(
          `METHODS • CollaborativeEditor / ondrop: dropped a media from the library`
        );

        const data = JSON.parse($event.dataTransfer.getData("text/plain"));
        console.log(data);

        if (data.media_filename) {
          // drop sur l’éditor et pas sur une ligne
          if ($event.target.classList.contains("ql-editor")) {
            console.log(
              "dropped on editor and not on line, will insert at the end of doc"
            );
            this.addMediaAtIndex(this.editor.getLength() - 1, data);
            return;
          }

          let _blot = this.getBlockFromElement($event.target);

          if (!_blot) {
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("notifications.failed_to_find_block_line"));
            return;
          }

          _blot = _blot.next ? _blot.next : _blot;

          const index = this.editor.getIndex(_blot);
          this.addMediaAtIndex(index, data);
        }
      }
    },

    removeDragoverFromBlots() {
      this.editor.getLines().map((b) => {
        while (b.parent !== b.scroll) {
          b = b.parent;
          if (b === b.scroll) {
            break;
          }
        }
        if (b !== b.scroll && b.domNode) {
          b.domNode.classList.remove("is--dragover");
        }
      });
    },
    removeFocusFromBlots() {
      this.editor
        .getLines()
        .map((b) => b.domNode.classList.remove("is--focused"));
    },
    getBlockFromElement(_target) {
      while (!_target.parentElement.classList.contains("ql-editor")) {
        _target = _target.parentElement;
        if (_target === null || !_target.parentElement) break;
      }
      let _blot = Quill.find(_target);
      if (_blot) {
        return _blot;
      }
      return false;
    },
  },
};
</script>
<style src="quill/dist/quill.snow.css"></style>
<style lang="scss">
.ql-snow .ql-picker {
  color: white;

  > * {
    // color: black;
  }

  .ql-picker-options {
    background-color: var(--c-popup-bg);
  }
}

.ql-snow .ql-picker.ql-header {
  width: 128px;
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
html[lang="fr"] .ql-tooltip a.ql-remove::before {
  content: "Supprimer";
}
html[lang="fr"] .ql-tooltip a.ql-action::after {
  content: "Modifier";
}
html[lang="fr"] .ql-tooltip::before {
  content: "Visiter le site :";
}

.m_collaborativeEditor {
  position: relative;
  font-family: "Work Sans";
  // height: 100%;
  // margin-left: 3em;
  // padding: 0 0.1em;
  color: rgb(27, 39, 41);

  // --active-color: black;
  --c-popup-bg: var(--c-noir);
  --c-popup-c: white;

  --c-toolbar-warning-bg: var(--c-rouge);
  --c-toolbar-warning-c: white;
  // --size-column-width: 800px;

  margin-left: 0;

  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
  justify-content: stretch;

  .ql-toolbar {
    flex: 0 0 auto;
  }
  .ql-container {
    flex: 1 1 0;
    width: 100%;
    height: auto;
    overflow: auto;

    .ql-editor {
      // height: auto;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }

  &.is--focussed {
    background-color: blue;
  }

  &.is--connexion_lost {
    cursor: not-allowed;
    .ql-toolbar {
      background-color: var(--c-toolbar-warning-bg);
      color: ar(--c-toolbar-warning-c);

      &::before {
        display: block;
      }

      html[lang="en"] &::before {
        content: "Connection lost, attempting to reconnect…";
      }
      html[lang="fr"] &::before {
        content: "Connexion au serveur perdue, reconnexion en cours…";
      }
      > * {
        display: none !important;
      }
    }
    // border-left: 2px solid rgba(255, 0, 0, 0.5);
  }

  &.is--receptiveToDrop {
    .ql-editor {
      background-color: #f9f9f9;
    }
    &.is--dragover {
      .ql-editor {
        > * {
          // background-image: linear-gradient(
          //   90deg,
          //   #ccc,
          //   #ccc 50%,
          //   transparent 0,
          //   transparent
          // );

          // background-size: 250% 4px;
        }
      }
    }
  }

  .ql-toolbar .ql-formats:first-child::before {
    /* content: "options :"; */
    position: relative;
    display: inline-block;
    float: left;
    font-size: 1rem;
    vertical-align: middle;
    font-weight: 400;
    /* background-color: #333; */
    /* left: -8px; */
    margin: 0;
    margin-top: 4px;
    font-weight: 400;
    /* padding: 11px; */
    /* margin-bottom: 10px; */
    /* text-decoration: underline; */
    font-size: 0.8rem;
    /* text-transform: uppercase; */
    /* margin-right: 15px; */
    /* font-style: italic; */
  }

  .ql-container.ql-bubble:not(.ql-disabled) a::before {
    line-height: 1.2;
  }

  .ql-tooltip {
    z-index: 1;
    border-radius: 1px;
    background-color: var(--c-popup-bg);
    color: var(--c-popup-c);
    border: 0px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

    .ql-preview {
      color: var(--c-popup-c);
    }

    input[type="text"] {
      color: black;
      border: 0px;
    }
    .ql-action {
      font-weight: normal;
      color: var(--c-popup-c);
    }

    a {
      color: white;
      text-decoration: underline;
    }
  }

  .ql-container {
    margin: 0 auto;

    &.ql-snow {
      border: 0;
    }
  }

  .ql-editor {
    position: relative;
    padding: 0;
    overflow: visible;
    height: 100%;
    overflow-y: auto;

    // caret-color: var(--active-color);
    line-height: inherit;
    padding: var(--spacing) calc(var(--spacing) * 2) 250px;

    transition: all 1s cubic-bezier(0.19, 1, 0.22, 1);

    body[data-mode="export_planning"] & {
      padding: 0 var(--spacing);
      position: relative;
    }

    &[contenteditable="false"] {
      // > *:not(.is--focused) {
      //   opacity: 0.5;
      //   cursor: default;
      // }
    }

    > * {
      position: relative;
      z-index: 1;

      // attention : à cause du drop il vaut mieux ne pas utiliser de margin
      // sinon pas moyen de savoir sur quel item c’est droppé
      margin: 0 auto;
      padding: 0;
      max-width: var(--size-column-width);

      background-position: 0 calc(100% - 3px);
      background-repeat: no-repeat;
      background-size: 250% 1px;
      transition: transform 0.5s linear;

      // background-image: linear-gradient(
      //   90deg,
      //   transparent,
      //   transparent 50%,
      //   transparent 0,
      //   transparent
      // );
      // background-image: linear-gradient(
      //   90deg,
      //   #ddd,
      //   #ddd 50%,
      //   transparent 0,
      //   transparent
      // );

      &.ql-mediacard {
        transform-origin: center top;
        border-radius: 0px;
        // margin-top: var(--spacing);
        // margin-bottom: var(--spacing);
        padding: calc(var(--spacing)) 0;
        // margin-left: calc(-1 * var(--spacing) / 2);
        // margin-right: calc(-1 * var(--spacing) / 2);

        .ql-mediacard--background {
          content: "";
          position: absolute;
          display: block;
          top: calc(var(--spacing) / 2);
          left: calc(-1 * var(--spacing) / 2);
          right: calc(-1 * var(--spacing) / 2);
          bottom: calc(var(--spacing) / 1);

          // background-color: rgba(0, 0, 0, 0.2);
          border: 2px solid var(--active-color);
          pointer-events: none;

          opacity: 0;
          z-index: 0;
        }

        img {
          display: block;
        }
        video {
          display: block;
          &:focus {
            outline: 0;
          }
        }

        figcaption {
          text-align: center;
          font-size: 75%;
          // font-weight: 600;
          color: #444;
          margin: 0 auto;
          padding: 0.4em 0;
          max-width: 33ch;
          line-height: 2;
          input {
            text-align: center;
            background-color: #d9d9d9;
            border: 0;
            border-radius: 4px;

            &:focus {
              background-color: #eee;
            }
          }
        }

        &:hover {
          // background-color: #eee;
          // box-shadow: 0 0 0 1px #fff, 0 0 0 2px var(--active-color);
        }

        &.is--focused {
          // outline: 0;
          // box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--active-color);
          // .ql-mediacard--background {
          //   opacity: 1;
          // }
        }
      }

      @keyframes scale-in {
        0% {
          opacity: 0;
          // max-height: 0px;
          transform: scale(1, 0.6);
        }
        100% {
          opacity: 1;
          // max-height: 50vh;
          transform: scale(1, 1);
        }
      }
      @keyframes scale-out {
        0% {
          opacity: 1;
          // max-height: 50vh;
          transform: scale(1, 1);
        }
        100% {
          opacity: 0;
          // max-height: 0px;
          height: 0;
          margin-top: 0;
          margin-bottom: 0;
          padding-top: 0;
          padding-bottom: 0;
          transform: scale(1, 0.6);
        }
      }

      // &::before {
      //   content: "";
      //   position: absolute;
      //   left: 0;
      //   right: 0;
      //   bottom: 0.15em;
      //   height: 1px;
      //   z-index: 0;
      //   border-bottom: 1px solid #e9e9e9;
      //   mix-blend-mode: darken;
      // }
    }
    > img {
      display: block;
    }
  }

  &.quillWrapper {
  }

  &.quillWrapper:hover,
  &.quillWrapper.is--focused {
    // color: rgba(40, 152, 217, 1);
    &::after {
      // content: "•";
      // display: block;
      // color: var(--active-color);
    }
  }

  .ql-editor.ql-blank::before {
    display: block;

    // position: relative;
    max-width: var(--size-column-width);
    margin: 0 auto;
    left: calc(var(--spacing) * 2);
    color: rgba(0, 0, 0, 0.6);
    font-style: normal;

    &:hover {
      color: black;
    }
  }

  .mediaTextContent {
    color: inherit;
    font-family: inherit;
    overflow: visible;

    > *:first-child {
      margin-top: 0;

      > *:first-child {
        margin-top: 0;
      }
    }

    // https://www.gridlover.net/try
    // fz : 16px
    // lh : 1.41
    // scale : 1.31

    font-size: 1.1em;
    line-height: 1.4375em;
    // max-width: 773px;
    // margin: auto;

    h1,
    .h1 {
      font-size: 2.25em;
      line-height: 1.27777778em;
      margin-top: 0.319444445em;
      margin-bottom: 0em;
    }
    h2,
    .h2 {
      font-size: 1.6875em;
      line-height: 1.7037037em;
      margin-top: 0.85185185em;
      margin-bottom: 0em;
    }
    h3,
    .h3 {
      font-size: 1em;
      line-height: 1.4375em;
      margin-top: 1.4375em;
      margin-bottom: 0em;
    }
    h4,
    .h4 {
      font-size: 1em;
      line-height: 1.4375em;
      margin-top: 1.4375em;
      margin-bottom: 0em;
    }
    h5,
    .h5 {
      font-size: 1em;
      line-height: 1.4375em;
      margin-top: 1.4375em;
      margin-bottom: 0em;
    }
    p,
    ul,
    ol,
    pre,
    table,
    blockquote {
      margin-top: 0em;
      margin-bottom: 0em;
    }
    ul ul,
    ol ol,
    ul ol,
    ol ul {
      margin-top: 0em;
      margin-bottom: 0em;
    }

    /* Let's make sure all's aligned */
    hr,
    .hr {
      border: 1px solid;
      margin: -1px 0;
    }
    // a,
    // b,
    // i,
    // strong,
    // em,
    // small,
    // code {
    //   line-height: 0;
    // }
    // sub,
    // sup {
    //   line-height: 0;
    //   position: relative;
    //   vertical-align: baseline;
    // }
    sup {
      top: -0.5em;
    }
    sub {
      bottom: -0.25em;
    }
    // gridlover end

    h1,
    h2 {
      & + h2 {
        margin-top: 0;
      }
    }

    ol,
    ul {
      padding: calc(var(--spacing) / 2) 1.5em;
      > li {
        padding-left: 0em;
      }
    }
    ul > li {
      list-style-type: disc;

      &::before {
        content: none;
        // content: "\2022";
      }
    }

    li::before {
      display: inline-block;
      white-space: nowrap;
      width: 1.2em;
    }

    ol li {
      counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8
        list-9;
      counter-increment: list-0;
    }
    ol li:before {
      content: counter(list-0, decimal) ". ";
      font-size: 75%;
      font-weight: 600;
    }

    strong,
    b {
      font-weight: 600;
    }

    p > a {
      text-decoration: underline;
      text-decoration-style: solid;
      color: var(--active-color);
      font-weight: 600;
    }

    h1,
    h2 {
      -webkit-hyphens: auto;
      -ms-hyphens: auto;
      hyphens: auto;

      strong,
      b {
        font-weight: 800;
      }
    }

    h1 {
      font-weight: 600;
    }

    h2,
    h3,
    h4 {
      font-weight: 600;
    }

    blockquote {
      border-left: 4px solid #ccc;
      margin-bottom: 5px;
      margin-top: 5px;
      padding-left: 16px;
    }

    code,
    pre {
      background-color: #f0f0f0;
      border-radius: 3px;
    }
    pre {
      white-space: pre-wrap;
      margin-bottom: 5px;
      margin-top: 5px;
      padding: 5px 10px;
    }
    code {
      font-size: 85%;
      padding: 2px 4px;
    }
  }
}

._customCaret {
  position: absolute;
  width: 2px;
  height: 1em;
  top: 0;
  left: 0;
  background-color: green;
  z-index: 1;

  animation: 1s blink step-end infinite;
}

@keyframes blink {
  from,
  to {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.ql-cursor-flag {
  display: none;
}

.ql-cursor {
  color: white;

  &#ql-cursor-_self {
    pointer-events: none;
  }
  small {
    color: inherit;
  }
}

.ql-toolbar.ql-snow .ql-formats {
  // display: block;
  // margin-right: 0 !important;
}
.ql-snow.ql-toolbar button,
.ql-snow .ql-toolbar button {
  // display: block;
  // float: none;
}

body[data-mode="export_planning"] .ql-toolbar {
  display: none;
}

.ql-toolbar.ql-snow {
  position: relative;
  // top: 30%;
  // left: 10px;

  width: 100%;
  max-width: var(--size-column-width);
  display: flex;
  flex-flow: row wrap;
  width: auto;
  margin: 0 auto;
  color: var(--c-popup-c);
  /* border-left: 0; */
  border: none;
  // border-radius: 0 0 4px 4px;
  // border-radius: 4px;
  // top: 121px;
  background-color: var(--c-popup-bg);
  border-radius: 1px;

  // &::before {
  //   content: "";
  //   display: block;
  //   position: absolute;
  //   top: 0;
  //   bottom: 0;
  //   left: 0;
  //   right: 0;
  //   z-index: -1;
  // }

  .ql-fill,
  .ql-stroke.ql-fill {
    fill: currentColor;
  }

  .ql-stroke {
    stroke: currentColor;
  }
}

.ql-snow.ql-toolbar button:hover .ql-stroke,
.ql-snow .ql-toolbar button:hover .ql-stroke,
.ql-snow.ql-toolbar button:focus .ql-stroke,
.ql-snow .ql-toolbar button:focus .ql-stroke,
.ql-snow.ql-toolbar button.ql-active .ql-stroke,
.ql-snow .ql-toolbar button.ql-active .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
.ql-snow.ql-toolbar button:hover .ql-stroke-miter,
.ql-snow .ql-toolbar button:hover .ql-stroke-miter,
.ql-snow.ql-toolbar button:focus .ql-stroke-miter,
.ql-snow .ql-toolbar button:focus .ql-stroke-miter,
.ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
.ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
  stroke: #0a997f;
}

.ql-snow.ql-toolbar button:hover,
.ql-snow .ql-toolbar button:hover,
.ql-snow.ql-toolbar button:focus,
.ql-snow .ql-toolbar button:focus,
.ql-snow.ql-toolbar button.ql-active,
.ql-snow .ql-toolbar button.ql-active,
.ql-snow.ql-toolbar .ql-picker-label:hover,
.ql-snow .ql-toolbar .ql-picker-label:hover,
.ql-snow.ql-toolbar .ql-picker-label.ql-active,
.ql-snow .ql-toolbar .ql-picker-label.ql-active,
.ql-snow.ql-toolbar .ql-picker-item:hover,
.ql-snow .ql-toolbar .ql-picker-item:hover,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected {
  color: #0a997f;
}

.ql-snow.ql-toolbar button:hover .ql-fill,
.ql-snow .ql-toolbar button:hover .ql-fill,
.ql-snow.ql-toolbar button:focus .ql-fill,
.ql-snow .ql-toolbar button:focus .ql-fill,
.ql-snow.ql-toolbar button.ql-active .ql-fill,
.ql-snow .ql-toolbar button.ql-active .ql-fill,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
.ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
.ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill {
  fill: #0a997f;
}

html[lang="fr"] .ql-picker.ql-header .ql-picker-label::before,
html[lang="fr"] .ql-picker.ql-header .ql-picker-item::before {
  content: "Texte courant";
}
html .ql-picker.ql-header .ql-picker-label::before,
html .ql-picker.ql-header .ql-picker-item::before {
  content: "Regular text";
}
html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "Titre 1";
  font-weight: 700;
}
html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "Titre 2";
  font-weight: 700;
}
html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "Titre 3";
  font-weight: 700;
}
html[lang="fr"] .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
html[lang="fr"] .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "Titre 4";
  font-weight: 700;
}

.ql-picker.ql-size .ql-picker-label[data-value="75%"]::before,
.ql-picker.ql-size .ql-picker-item[data-value="75%"]::before {
  content: "Small";
  font-size: 70% !important;

  html[lang="fr"] & {
    content: "Petit";
  }
}
.ql-picker.ql-size .ql-picker-label:not([data-value])::before,
.ql-picker.ql-size .ql-picker-item:not([data-value])::before {
  content: "Regular";
  font-size: 100% !important;

  html[lang="fr"] & {
    content: "Normal";
  }
}
.ql-picker.ql-size .ql-picker-label[data-value="150%"]::before,
.ql-picker.ql-size .ql-picker-item[data-value="150%"]::before {
  content: "Large";
  font-size: 150% !important;

  html[lang="fr"] & {
    content: "Grand";
  }
}
.ql-picker.ql-size .ql-picker-label[data-value="300%"]::before,
.ql-picker.ql-size .ql-picker-item[data-value="300%"]::before {
  content: "Huge";
  font-size: 300% !important;

  html[lang="fr"] & {
    content: "Énorme";
  }
}

.ql-picker.ql-size .ql-picker-label[data-value]::before {
  font-size: 100% !important;
}

.ql-picker.ql-font .ql-picker-label[data-value=""]::before,
.ql-picker.ql-font .ql-picker-item[data-value=""]::before {
  content: "IBM Plex Sans";
  font-family: "IBM Plex Sans";
}

.ql-picker.ql-font .ql-picker-label[data-value="Alegreya"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="Alegreya"]::before {
  content: "Alegreya";
  font-family: "Alegreya";
}

.ql-picker.ql-font .ql-picker-label[data-value="Roboto Mono"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="Roboto Mono"]::before {
  content: "Roboto mono";
  font-family: "Roboto Mono";
}
.ql-picker.ql-font .ql-picker-label[data-value="Roboto"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="Roboto"]::before {
  content: "Roboto";
  font-family: "Roboto";
}
.ql-picker.ql-font .ql-picker-label[data-value="Source Sans Pro"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="Source Sans Pro"]::before {
  content: "Source Sans Pro";
  font-family: "Source Sans Pro";
}
.ql-picker.ql-font .ql-picker-label[data-value="PT Serif"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="PT Serif"]::before {
  content: "PT Serif";
  font-family: "PT Serif";
}
.ql-picker.ql-font .ql-picker-label[data-value="Work Sans"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="Work Sans"]::before {
  content: "Work Sans";
  font-family: "Work Sans";
}
.ql-picker.ql-font .ql-picker-label[data-value="Karla"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="Karla"]::before {
  content: "Karla";
  font-family: "Karla";
}
.ql-picker.ql-font .ql-picker-label[data-value="Source Serif Pro"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="Source Serif Pro"]::before {
  content: "Source Serif Pro";
  font-family: "Source Serif Pro";
}
.ql-picker.ql-font .ql-picker-label[data-value="IBM Plex Serif"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="IBM Plex Serif"]::before {
  content: "IBM Plex Serif";
  font-family: "IBM Plex Serif";
}
.ql-picker.ql-font .ql-picker-label[data-value="Volkhov"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="Volkhov"]::before {
  content: "Volkhov";
  font-family: "Volkhov";
}
.ql-picker.ql-font .ql-picker-label[data-value="Archivo Black"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="Archivo Black"]::before {
  content: "Archivo Black";
  font-family: "Archivo Black";
}
.ql-picker.ql-font .ql-picker-label[data-value="Spectral"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="Spectral"]::before {
  content: "Spectral";
  font-family: "Spectral";
}

body:not([data-mode="export_planning"]).ql-editor {
  counter-reset: listCounter;

  & > * {
    counter-increment: listCounter;

    &::before {
      content: "";

      font-family: "IBM Plex Sans", "OutputSansVariable";
      position: absolute;
      top: 2px;
      right: 100%;
      margin-right: var(--spacing);
      margin-right: 0;

      font-size: 0.6rem;
      font-weight: 600;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      // display: inline-block;
      // float: left;
      width: var(--spacing);
      max-width: 100px;
      padding-right: calc(var(--spacing) / 2);
      color: transparent;
      color: hsl(210, 11%, 78%);

      transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

      content: counter(listCounter);
      // font-size: 0.8rem;
      // color: var(--active-color);
      // color: hsl(210, 11%, 58%);
    }

    &.is--focused,
    &.is--dragover {
      &::before {
        content: counter(listCounter);
        // font-size: 0.8rem;
        color: var(--active-color);
        color: hsl(210, 11%, 58%);
      }
    }

    &::after {
      content: "";
      display: block;
      width: 100%;
      height: 0;
      margin: 0;
      background-color: var(--color-MediaLibrary);
    }

    &.is--dragover {
      &::after {
        margin: var(--spacing) 0;
        height: 4px;
        transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
      }
    }
  }
}
// .ql-clipboard {
//   position: fixed;
// }

._button_removeMedia {
  position: absolute;
  top: var(--spacing);
  right: 0;
  background: white;
  text-decoration: none;
  line-height: 0;
  width: 1.5em;
  height: 1.5em;
  border-bottom-left-radius: 2px;
}
</style>
