<template>
  <div
    class="_collaborativeEditor"
    :class="{
      'is--editable': can_edit,
    }"
    :data-editable="editor_is_enabled"
    @click="editorClick"
  >
    <TextVersioning
      v-if="show_archives"
      :path="path"
      :current_content="content"
      @close="show_archives = false"
      @restore="restoreVersion"
    />

    <component :is="`style`" v-html="quill_styles" />
    <div ref="editBtn" class="_btnContainer" v-if="can_edit">
      <small class="_btnRow">
        <sl-button
          variant="edit"
          class="editBtn"
          size="small"
          pill
          @click="toggleEdit"
        >
          <sl-icon name="pencil-fill" :label="$t('edit')" />
          <template v-if="!editor_is_enabled"> Modifier </template>
          <template v-else> Arrêter les modifications </template>
        </sl-button>

        <sl-button
          v-if="editor_is_enabled"
          @click="show_archives = !show_archives"
          size="small"
        >
          <sl-icon slot="prefix" name="archive" />
          Archives
        </sl-button>

        <div class="_collabEditorStatus" v-if="editor_is_enabled">
          <transition name="fade_fast" mode="out-in">
            <span v-if="is_loading_or_saving" key="saving">
              <sl-spinner style="--indicator-color: currentColor" />
              {{ $t("saving…") }}
            </span>
            <span v-else-if="show_saved_icon" key="saved">
              <sl-icon name="check-circle" />
              {{ $t("saved") }}
            </span>
            <span v-else key="connected">
              <b>{{ rtc.connection_state }}</b>
            </span>
          </transition>
        </div>

        <!-- <sl-button v-show="editor_is_enabled" @click="saveText" size="small">
          Enregistrer
        </sl-button> -->
      </small>
    </div>

    <div>
      <div
        ref="editor"
        class="_mainText"
        @dragover="onDragover"
        @drop="onDrop"
      />
    </div>
  </div>
</template>
<script>
import TextVersioning from "./TextVersioning.vue";
import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";
ShareDB.types.register(require("rich-text").type);

import { toolbar, fonts, formats } from "./imports/defaults.js";

const FontAttributor = Quill.import("attributors/style/font");
FontAttributor.whitelist = fonts;
Quill.register(FontAttributor, true);

var BlockEmbed = Quill.import("blots/block/embed");
class DividerBlot extends BlockEmbed {}
DividerBlot.blotName = "divider";
DividerBlot.tagName = "hr";
Quill.register(DividerBlot);

import MediaBlot from "./imports/MediaBlot";
import CardEditableModule from "./imports/CardEditableModule";

Quill.register("formats/media", MediaBlot);
Quill.register("modules/cardEditable", CardEditableModule);

// how it works:
// -> disabled by default
// -> if is_collaborative is true, it uses sharedb on the server to handle conflict-free editing

export default {
  props: {
    path: String,
    content: String,
    scrollingContainer: HTMLElement,
    line_selected: [Boolean, Number],
    can_edit: Boolean,
  },
  components: {
    TextVersioning,
  },
  data() {
    return {
      editor: null,
      text_deltas: null,

      rtc: {
        socket: null,
        connection_state: null,
      },

      show_archives: false,

      debounce_textUpdate: undefined,

      is_collaborative: true,
      autosave: true,
      editor_is_enabled: false,
      doc: undefined,

      is_loading_or_saving: false,
      show_saved_icon: false,

      currently_selected_eles: false,

      editor_id: (Math.random().toString(36) + "00000000000000000").slice(
        2,
        5 + 5
      ),
    };
  },
  created() {},
  mounted() {
    this.initEditor();
    // this.enableEditor();
  },
  beforeDestroy() {
    this.disableEditor();
  },
  watch: {
    content() {
      if (
        !this.is_collaborative ||
        (this.is_collaborative && !this.editor_is_enabled)
      ) {
        this.$nextTick(() => {
          this.editor.root.innerHTML = this.content;
        });
      }
    },
    line_selected: {
      handler() {
        if (this.line_selected) {
          // let [line, offset] = quill.getLine(this.line_selected);
          this.$nextTick(() => {
            const selected_line = this.editor.container.querySelector(
              `.ql-editor > *:nth-child(${this.line_selected})`
            );
            this.currently_selected_eles = [selected_line];
            this.$nextTick(() => {
              selected_line.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
              });
            });
          });
        }
        this.currently_selected_eles = false;
      },
      immediate: true,
    },
    currently_selected_eles(newEles) {
      this.editor.container
        .querySelectorAll(".is--selected")
        .forEach((el) => el.classList && el.classList.remove("is--selected"));

      if (newEles)
        newEles.forEach(
          (el) => el.classList && el.classList.add("is--selected")
        );
    },
  },
  computed: {
    quill_styles() {
      let css = "";
      for (const font of fonts) {
        css += `
.ql-picker.ql-font .ql-picker-label[data-value="${font}"]::before,
.ql-picker.ql-font .ql-picker-item[data-value="${font}"]::before {
  content: "${font}";
  font-family: "${font}";
}
        `;
      }
      return css;
    },
  },
  methods: {
    async initEditor() {
      this.editor = new Quill(this.$refs.editor, {
        // debug: "info",
        modules: {
          cardEditable: true,
          toolbar: toolbar,
        },
        bounds: this.$refs.editor,
        theme: "snow",
        formats,
        placeholder: "",
        readOnly: !this.editor_is_enabled,
        scrollingContainer: this.scrollingContainer,
      });
      if (this.content) this.editor.root.innerHTML = this.content;

      this.setStatusButton();

      this.editor.on("selection-change", () => {
        // console.log(`CollaborativeEditor / selection-change`);
        this.updateSelectedLines();
      });
      this.editor.on("text-change", (delta, oldDelta, source) => {
        delta, oldDelta, source;

        this.$nextTick(() => {
          // todo : only update if possibly changing line (backspace and enter)
          this.updateSelectedLines();
        });
      });
    },

    getEditorContent() {
      console.log(`CollaborativeEditor • getEditorContent`);
      if (!this.editor.getText() || this.editor.getText() === "\n") return "";
      let html = this.editor.root.innerHTML;

      html = this.cleanEditorContent(html);

      return html;
    },
    cleanEditorContent(html) {
      console.log(`CollaborativeEditor • cleanEditorContent`);

      var t = document.createElement("template");
      t.innerHTML = html;

      // used to make sure we don’t get weird stuff such as <p style="font-family: "Avada";">plop</p>
      // content = content.replace(/&quot;/g, "'");
      // todo : remove status class like is--selected or is--dragover
      t.content
        .querySelectorAll(".is--selected")
        .forEach((el) => el.classList && el.classList.remove("is--selected"));

      return t.innerHTML;
    },

    setStatusButton() {
      if (this.$refs.editBtn)
        this.$el.querySelector(".ql-toolbar").appendChild(this.$refs.editBtn);
    },
    toggleEdit() {
      if (!this.editor_is_enabled) this.enableEditor();
      else this.disableEditor();

      this.setStatusButton();
    },
    async enableEditor() {
      if (this.is_collaborative) await this.startCollaborative();
      this.editor.enable();
      this.editor_is_enabled = true;
    },
    disableEditor() {
      this.editor.setSelection(null);
      this.editor.blur();
      this.updateSelectedLines();

      if (this.is_collaborative) this.endCollaborative();

      this.$nextTick(() => {
        this.editor.disable();
        this.editor_is_enabled = false;
      });
    },

    restoreVersion(content) {
      // TODO : with delta to allow for undo
      // this.editor.root.innerHTML = content;
      const value = content;
      const delta = this.editor.clipboard.convert(value);

      this.editor.setContents(delta, "user");

      this.show_archives = false;
    },

    editorClick($event) {
      $event.preventDefault();
      if (
        $event.target.parentElement.classList &&
        $event.target.parentElement.classList.contains("ql-editor")
      ) {
        // click on the left of the element
        if ($event.offsetX < 0) {
          const line_number = Array.from(
            $event.target.parentElement.children
          ).findIndex((c) => c === $event.target);
          this.$emit("lineClicked", line_number + 1);
        }
      }
    },

    updateSelectedLines() {
      // console.log(`CollaborativeEditor • updateSelectedLines`);
      if (!this.editor_is_enabled) return;

      const range = this.editor.getSelection();

      if (range && range.index) {
        // console.log(
        //   `CollaborativeEditor • updateSelectedLines / range.index = ${range.index} et range.length = ${range.length} `
        // );

        let blots = [];
        if (range.length === 0) blots = [this.editor.getLine(range.index)[0]];
        else blots = this.editor.getLines(range.index, range.length);

        if (blots) {
          this.currently_selected_eles = blots.map((b) => b.domNode);
          return;
        }
      }

      this.currently_selected_eles = false;
    },

    async saveText() {
      this.is_loading_or_saving = true;

      const new_meta = {
        $content: this.getEditorContent(),
      };

      try {
        await this.$api.updateMeta({
          path: this.path,
          new_meta,
        });
        this.is_loading_or_saving = false;
        this.show_saved_icon = true;
        await new Promise((r) => setTimeout(r, 1500));
        this.show_saved_icon = false;
      } catch (err) {
        if (err.message === "content not changed") err;
        this.is_loading_or_saving = false;
      }
    },

    async startCollaborative() {
      // const params = new URLSearchParams({
      //   folder_type: this.folder_type,
      //   folder_slug: this.folder_slug,
      //   meta_slug: this.meta_slug,
      // });

      // const requested_querystring = "?" + params.toString();
      const path_to_meta = this.path.replaceAll("/", "_");

      const requested_resource_url =
        (location.protocol === "https:" ? "wss" : "ws") +
        "://" +
        window.location.host +
        "/isSharedb" +
        `?path_to_meta=${path_to_meta}`;

      console.log(
        `CollaborativeEditor / startCollaborative : will connect to ws server with ${requested_resource_url}`
      );

      this.rtc.socket = new ReconnectingWebSocket(requested_resource_url);
      const connection = new ShareDB.Connection(this.rtc.socket);
      connection.on("state", (state) => {
        this.rtc.connection_state = state.toString();
      });

      console.log(`CollaborativeEditor / connecting to doc ${path_to_meta}`);
      this.doc = connection.get("collaborative_texts", path_to_meta);

      this.doc.subscribe((err) => {
        if (err) console.error(`CollaborativeEditor / err ${err}`);
        console.log(`CollaborativeEditor / doc subscribe`);

        if (this.doc.type) {
          console.log(
            `CollaborativeEditor / doc already exists and doc.data = ${JSON.stringify(
              this.doc.data
            )}`
          );
          this.editor.setContents(this.doc.data, "init");
        } else {
          this.doc.create(this.editor.getContents(), "rich-text");
        }

        this.editor.history.clear();
        this.editor.on("text-change", (delta, oldDelta, source) => {
          console.log(`CollaborativeEditor / text-change w source ${source}`);
          if (source === "user") {
            this.doc.submitOp(delta, { source: this.editor_id });
            console.log(
              `CollaborativeEditor / submitted op to server ${JSON.stringify(
                delta
              )}`
            );
            this.updateTextMedia();
          }
        });
        this.doc.on("op", (op, source) => {
          console.log(`CollaborativeEditor / op applied`);
          this.text_deltas = this.doc.data;
          if (source === this.editor_id) return;
          console.log(`CollaborativeEditor / outside op applied`);
          this.editor.updateContents(op);
        });
      });

      this.doc.on("error", (err) => {
        // err;
        // soucis : les situations ou le serveur a été fermé et en le rouvrant il ne possède plus d’instance du doc dans sharedb…
        console.error(`CollaborativeEditor / doc err ${err}`);
      });
    },
    endCollaborative() {
      if (this.rtc.socket) this.rtc.socket.close();
      if (this.doc) this.doc.unsubscribe();
    },

    updateTextMedia() {
      if (this.debounce_textUpdate) clearTimeout(this.debounce_textUpdate);
      this.debounce_textUpdate = setTimeout(async () => {
        console.log(
          `CollaborativeEditor • updateTextMedia: saving new snapshot`
        );
        await this.saveText();
      }, 1000);
    },

    addMediaAtTheEnd(media) {
      this.addMediaAtIndex(this.editor.getLength() - 1, media);
    },
    addMediaAtCaretPosition(media) {
      const selection = this.editor.getSelection(true);
      if (selection && selection.index) {
        this.addMediaAtIndex(selection.index, media);
        return;
      }
      this.addMediaAtTheEnd(media);
    },
    addMediaAtIndex(index, media) {
      console.log(`CollaborativeEditor • addMediaAtIndex ${index}`);
      // TODO fix
      const mediaURL = `./${this.folder_slug}/${media.media_filename}`;
      // const mediaURL =
      //   this.$root.state.mode === "export_publication"
      //     ? `./${this.folder_slug}/${media.media_filename}`
      //     : `/${this.folder_slug}/${media.media_filename}`;

      // setting editor focus and selection can cause the scroll to "jump"
      // not exactly a good idea…
      // this.editor.setSelection(index, Quill.sources.SILENT);
      // this.editor.focus();

      this.editor.blur();

      const { $type, caption, $path } = media;
      $path;

      if ($type === "image") {
        const thumb_path = media.$thumbs[1600];
        if (thumb_path) {
          // this.editor.insertText(index, "\n", Quill.sources.USER);
          this.editor.insertEmbed(
            index,
            "media",
            {
              type: $type,
              caption,
              // TODO update with $path
              // meta_filename: $slug,
              // src: `/thumbs/${this.folder_type}/${this.folder_slug}/${thumb_path}`,
            },
            Quill.sources.USER
          );
          // this.editor.setSelection(index + 1, Quill.sources.SILENT);
        }
      } else if ($type === "video") {
        // this.editor.insertText(index, "\n", Quill.sources.USER);
        this.editor.insertEmbed(
          index,
          "media",
          {
            type: $type,
            caption,
            // TODO update with $path
            meta_filename: $path,
            src: mediaURL,
          },
          Quill.sources.USER
        );
        // this.editor.setSelection(index + 1, Quill.sources.SILENT);
      } else if ($type === "audio") {
        this.editor.insertEmbed(
          index,
          "media",
          {
            type: $type,
            caption,
            // TODO update with $path
            meta_filename: $path,
            src: mediaURL,
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

    onDragover($event) {
      if (!this.editor_is_enabled) return;
      console.log(`CollaborativeEditor2 / onDragover`);
      $event.preventDefault();
      // todo debounce dragover to trigger only a handful of times per seconds
      // const el = $event.target;
      let _blot = this.getBlockFromElement($event.target);
      if (!_blot) return false;

      // do nothing if dragover on
      // if (el.classList.contains("ql-editor")) return;

      // if (el.parentElement.classList.contains("ql-editor")) {
      if (!_blot.domNode.classList.contains("is--dragover")) {
        _blot.domNode.classList.add("is--dragover");
        _blot.domNode.addEventListener("dragleave", () => {
          console.log(`CollaborativeEditor2 / dragleave`);
          _blot.domNode.classList.remove("is--dragover");
        });
      }
    },
    // onDragLeave($event) {},
    onDrop($event) {
      if (!this.editor_is_enabled) return;
      console.log(`CollaborativeEditor2 / onDrop`);

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "move";

      this.removeDragoverFromBlots();

      if ($event.dataTransfer.getData("text/plain") === "media_in_quill") {
        console.log(
          `CollaborativeEditor2 / onDrop : : drag and dropped a media from quill`
        );

        let _blot = this.getBlockFromElement($event.target);
        const index = this.editor.getIndex(_blot);

        // find which blot was dragged (A)
        // find where it was dropped (B)
        // move delta from A to B

        console.log(`_blot is currently at index ${index}`);
      } else if ($event.dataTransfer.getData("text/plain")) {
        console.log(
          `CollaborativeEditor2 / onDrop : : dropped a media from the library`
        );

        const media = JSON.parse($event.dataTransfer.getData("text/plain"));
        console.log(media);

        if (media.media_filename) {
          // drop sur l’éditor et pas sur une ligne
          if ($event.target.classList.contains("ql-editor")) {
            console.log(
              "dropped on editor and not on line, will insert at the end of doc"
            );
            this.addMediaAtIndex(this.editor.getLength() - 1, media);
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

          _blot =
            _blot.next !== null && _blot.next.domNode ? _blot.next : _blot;

          const index = this.editor.getIndex(_blot);
          this.addMediaAtIndex(index - 1, media);
        }
      } else {
        console.log(
          `CollaborativeEditor2 / onDrop : missing meta for drop to occur`
        );
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

    getBlockFromElement(_target) {
      while (!_target.parentElement.classList.contains("ql-editor")) {
        _target = _target.parentElement;
        if (_target === null || !_target.parentElement) break;
      }
      let _blot = Quill.find(_target);
      if (_blot) return _blot;
      return false;
    },
  },
};
</script>
<style src="quill/dist/quill.snow.css"></style>
<style lang="scss" scoped>
._collaborativeEditor {
  position: relative;
  font-size: 100%;
  // border-top: var(--border-size) solid var(--editor-bg);

  --toolbar-bg: var(--editor-bg);
  --editor-bg: #eee;
  --button-size: 32px;
  --border-size: 4px;
  --quill-options-size: 2.2rem;

  &:not(.is--editable) {
    border: none;
    ::v-deep .ql-toolbar {
      display: none;
    }
  }

  ::v-deep .ql-toolbar {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: calc(var(--spacing) / 2);

    display: flex;
    flex-flow: row wrap;
    gap: calc(var(--spacing) / 2);
    justify-content: flex-start;
    align-items: center;

    font-size: inherit;
    font-family: inherit;
    font-weight: normal;
    background-color: var(--toolbar-bg);
    color: #333 !important;

    // border-radius: 0.5em;
    border: none;
    // border-bottom: var(--border-size) dotted var(--editor-bg);
    // border-bottom-style: double;

    &::after {
      display: none;
    }
    button,
    svg {
      color: currentColor;
    }

    .ql-fill,
    .ql-stroke.ql-fill {
      fill: currentColor;
    }

    .ql-stroke {
      stroke: currentColor;
    }

    .ql-picker {
      color: currentColor;
    }

    .ql-picker.ql-font {
      width: 140px;
    }
    .ql-color-picker,
    .ql-icon-picker {
      width: var(--quill-options-size);
    }

    .ql-formats {
      // margin-right: calc(var(--spacing) / 2);
      // margin-bottom: calc(var(--spacing) / 2);
      margin: 0;
      display: flex;
      flex-flow: row nowrap;
      border: 2px solid var(--c-gris-clair);
      border-radius: 12px;
      background: #fff;

      button,
      > *:not(.ql-size):not(.ql-header):not(.ql-font) .ql-picker-label {
        display: flex;
        align-items: center;
        justify-content: center;
        svg {
          width: var(--quill-buttons-size);
          height: var(--quill-buttons-size);
        }
      }

      .ql-font {
        background: var(--editor-bg);
      }
      .ql-header {
        background: var(--editor-bg);
      }
      .ql-picker {
        height: var(--button-size);
      }
      .ql-picker-label {
        text-align: left;
        padding: 4px;
        background: white;
      }
      .ql-picker-label::before {
        // line-height: var(--button-size);
      }
    }

    .ql-picker.ql-header {
      width: 115px !important;
    }
    .ql-picker.ql-font {
      width: 160px !important;

      &::before {
      }
    }

    html & .ql-picker.ql-header {
      .ql-picker-label,
      .ql-picker-item {
        &::before {
          content: "Regular text";
        }
      }
    }
    html[lang="fr"] & .ql-picker.ql-header {
      .ql-picker-label,
      .ql-picker-item {
        &::before {
          content: "Texte courant";
        }

        &[data-value="1"]::before {
          content: "Titre 1";
          font-weight: 700;
        }
        &[data-value="2"]::before {
          content: "Titre 2";
          font-weight: 700;
        }
        &[data-value="3"]::before {
          content: "Titre 3";
          font-weight: 700;
        }
        &[data-value="4"]::before {
          content: "Titre 4";
          font-weight: 700;
        }
      }
    }

    // .ql-picker.ql-size .ql-picker-label[data-value="75%"]::before,
    // .ql-picker.ql-size .ql-picker-item[data-value="75%"]::before {
    //   content: "Small";
    //   font-size: 70% !important;

    //   html[lang="fr"] & {
    //     content: "Petit";
    //   }
    // }
    // .ql-picker.ql-size .ql-picker-label:not([data-value])::before,
    // .ql-picker.ql-size .ql-picker-item:not([data-value])::before {
    //   content: "Regular";
    //   font-size: 100% !important;

    //   html[lang="fr"] & {
    //     content: "Normal";
    //   }
    // }
    // .ql-picker.ql-size .ql-picker-label[data-value="150%"]::before,
    // .ql-picker.ql-size .ql-picker-item[data-value="150%"]::before {
    //   content: "Large";
    //   font-size: 150% !important;

    //   html[lang="fr"] & {
    //     content: "Grand";
    //   }
    // }
    // .ql-picker.ql-size .ql-picker-label[data-value="300%"]::before,
    // .ql-picker.ql-size .ql-picker-item[data-value="300%"]::before {
    //   content: "Huge";
    //   font-size: 300% !important;

    //   html[lang="fr"] & {
    //     content: "Énorme";
    //   }
    // }

    .ql-picker.ql-size .ql-picker-label[data-value]::before {
      font-size: 100% !important;
    }
    z ._btnContainer {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      // background-color: var(--editor-bg);
    }
  }

  ::v-deep {
    .ql-container {
      font-size: 110%;
      font-family: inherit;
      font-weight: normal;
      background-color: var(--toolbar-bg);
      border: 0;

      &:not(.ql-disabled) {
        .ql-editor {
          > * {
            &::before {
            }
          }
        }
      }
    }

    .ql-editor {
      padding: 0;
      counter-reset: listCounter;
      height: auto;
      overflow: visible;

      padding: 0 0 0 calc(var(--spacing) * 2);
      background-color: white;

      padding-bottom: calc(var(--spacing) * 1);

      @import "./imports/mainText.scss";

      > * {
        counter-increment: listCounter;
        position: relative;
        // padding-left: calc(var(--spacing));

        &::before {
          content: counter(listCounter);
          cursor: pointer;

          /* old way : pos abs */
          position: absolute;
          // padding-top: 0.85em;
          right: 100%;
          text-align: right;
          height: 100%;

          font-size: 0.6rem;
          text-align: center;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          line-height: 3;
          width: calc(var(--spacing) * 2);
          max-width: 100px;
          line-height: 2.5;
          color: transparent;
          color: hsl(210, 11%, 18%);

          // position: relative;
          // display: inline-block;
          // font-size: 0.6rem;
          // vertical-align: baseline;
          // width: calc(var(--spacing) * 2);
          // margin-left: calc(var(--spacing) * 2 * -1);

          transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
        }

        &.is--selected {
          &::before {
            background-color: var(--active-color);
          }
        }

        &::after {
          content: "";
          display: block;
          width: 100%;
          height: 0;
          margin: 0;
          background-color: var(--active-color);
          transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
        }

        &.is--dragover {
          &::after {
            margin: 4px 0;
            height: 4px;
          }
        }
      }
    }

    .ql-container.ql-disabled {
      .ql-editor > * {
        cursor: inherit;
      }
    }
  }
}

._collaborativeEditor:not([data-editable="true"]) {
  ::v-deep .ql-formats {
    display: none;
  }
}

._btnRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
._collabEditorStatus {
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  background-color: var(--c-vert);
  border-radius: 2em;
  color: black;
}
</style>
