<template>
  <div
    class="_collaborativeEditor"
    :class="{
      'is--editable': can_edit,
      'is--editing_is_enabled': editor_is_enabled,
      'is--mobileView': $root.is_mobile_view,
    }"
    @click="editorClick"
  >
    <DLabel
      v-if="label"
      :str="label"
      :instructions="can_edit ? instructions : ''"
    />
    <TextVersioning
      v-if="show_archives"
      :path="path"
      :current_content="content"
      @close="show_archives = false"
      @restore="restoreVersion"
    />

    <component :is="`style`">
      {{ quill_styles }}
    </component>

    <div
      ref="editBtn"
      class="_TEbtnContainer"
      v-show="can_edit && editor_is_enabled"
    >
      <div class="">
        <template v-if="editor_is_enabled && !is_disabling_editor">
          <!-- <button type="button" class="u-button _editBtn" @click="toggleEdit">
            <b-icon icon="check-circle-fill" :aria-label="$t('stop_edit')" />
            <span>{{ $t("stop_edit") }}</span>
          </button> -->
          <transition name="pagechange" mode="out-in">
            <div
              class="u-button _savingStatus"
              v-if="is_loading_or_saving"
              key="saving"
            >
              <LoaderSpinner />
              {{ $t("saving") }}
            </div>
            <div
              class="u-button _savedStatus"
              v-else-if="show_saved_icon"
              key="saved"
            >
              <b-icon icon="check-circle" />
              {{ $t("saved") }}
            </div>
            <!-- <span v-else key="connected">
                <b>{{ $t(rtc.connection_state) }}</b>
              </span> -->
            <button
              type="button"
              class="u-button _archivesBtn"
              v-else-if="field_to_edit === '$content' && path"
              @click="show_archives = !show_archives"
            >
              <b-icon icon="archive" />
              <span>{{ $t("history") }}</span>
            </button>
          </transition>
          <EditBtn
            class="_editBtn"
            :btn_type="'check'"
            :label_position="'left'"
            @click="disableEditor"
          />
        </template>
      </div>
    </div>

    <div class="_floatingEditBtn" v-if="can_edit && !editor_is_enabled">
      <EditBtn key="editbtn" :label_position="'left'" @click="toggleEdit" />
    </div>

    <div class="_toolbarAndEditorContainer">
      <div ref="editor" @dragover="onDragover" @drop="onDrop" />
    </div>
  </div>
</template>
<script>
import TextVersioning from "./TextVersioning.vue";
import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";
import richText from "rich-text";
ShareDB.types.register(richText.type);

import {
  fonts as default_fonts,
  formats as default_formats,
  fontSizeArr,
  lineHeightArr,
} from "./imports/defaults.js";

// var Parchment = Quill.import("parchment");
// var lineHeightConfig = {
//   scope: Parchment.Scope.BLOCK,
//   whitelist: lineHeightArr,
// };
// var lineHeightClass = new Parchment.Attributor.Class(
//   "lineheight",
//   "ql-line-height",
//   lineHeightConfig
// );
// var lineHeightStyle = new Parchment.Attributor.Style(
//   "lineheight",
//   "line-height",
//   lineHeightConfig
// );
// Parchment.register(lineHeightClass);
// Parchment.register(lineHeightStyle);
var Size = Quill.import("attributors/style/size");
Size.whitelist = fontSizeArr;
Quill.register(Size, true);

const FontAttributor = Quill.import("attributors/style/font");
const merge = (a, b, i = 0) => [...a.slice(0, i), ...b, ...a.slice(i)];
const custom_fonts_titles = window.app_infos.custom_fonts.map((cf) => cf.title);
const all_fonts = merge(default_fonts, custom_fonts_titles, 1);
FontAttributor.whitelist = all_fonts;
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
    label: {
      type: String,
      default: "",
    },
    instructions: String,
    path: String,
    sharedb_id: String,
    content: String,
    field_to_edit: {
      type: String,
      default: "$content",
    },
    scrollingContainer: HTMLElement,
    custom_formats: Array,
    line_selected: [Boolean, Number],
    edit_on_mounted: Boolean,
    can_edit: Boolean,
    is_collaborative: {
      type: Boolean,
      default: true,
    },
    // enabled for page_by_page, this means that the edit button is located in the top right corner in absolute,
    // and that the toolbar moves to the closest parent dedicated container after creation
  },
  components: {
    TextVersioning,
  },
  data() {
    return {
      editor: null,
      text_deltas: null,
      toolbar_el: null,
      tooltip_el: null,

      rtc: {
        socket: null,
        connection_state: null,
      },

      show_archives: false,

      debounce_textUpdate: undefined,

      collaborative_is_loaded: false,

      autosave: true,
      editor_is_enabled: false,
      doc: undefined,

      is_loading_or_saving: false,
      is_disabling_editor: false,
      show_saved_icon: false,

      currently_selected_eles: false,

      editor_id: (Math.random().toString(36) + "00000000000000000").slice(
        2,
        5 + 5
      ),
    };
  },
  created() {},
  async mounted() {
    await this.initEditor();
    this.toolbar_el = this.$el.querySelector(".ql-toolbar");
    this.tooltip_el = this.$el.querySelector(".ql-tooltip");
    if (this.edit_on_mounted === true) this.enableEditor();

    this.$eventHub.$on("media.enableEditor." + this.path, this.enableEditor);
    this.$eventHub.$on("media.disableEditor." + this.path, this.disableEditor);
  },
  beforeDestroy() {
    this.disableEditor();

    this.$eventHub.$off("media.enableEditor." + this.path, this.enableEditor);
    this.$eventHub.$off("media.disableEditor." + this.path, this.disableEditor);
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
    can_edit() {
      if (!this.can_edit && this.editor_is_enabled) this.disableEditor();
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
      for (const font of all_fonts) {
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
      const toolbar = this.makeToolbar();

      this.editor = new Quill(this.$refs.editor, {
        // debug: "info",
        modules: {
          cardEditable: true,
          toolbar: toolbar,
        },
        bounds: this.$refs.editor,
        theme: "snow",
        formats: this.custom_formats || default_formats,
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
        // console.log(`CollaborativeEditor / text-change w source ${source}`);
        this.$nextTick(() => {
          // todo : only update if possibly changing line (backspace and enter)
          this.updateSelectedLines();
        });
      });
    },

    makeToolbar() {
      let container = [];
      let reference_formats = this.custom_formats || default_formats;

      if (reference_formats.includes("font"))
        container.push([
          {
            font: all_fonts,
          },
        ]);
      if (reference_formats.includes("header"))
        container.push([{ header: [false, 1, 2, 3] }]);
      if (reference_formats.includes("size"))
        container.push([{ size: fontSizeArr }]);
      // if (reference_formats.includes("lineheight"))
      //   container.push([{ lineheight: lineHeightArr }]);

      let formatting_opt = [];
      const basic_formatting = [
        "bold",
        "italic",
        "underline",
        "strike",
        "link",
        "blockquote",
      ];
      basic_formatting.map((bf) => {
        if (reference_formats.includes(bf)) formatting_opt.push(bf);
      });
      container.push(formatting_opt);

      if (reference_formats.includes("color"))
        container.push([
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
        ]);
      if (reference_formats.includes("background"))
        container.push([
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
        ]);

      if (reference_formats.includes("list"))
        container.push([{ list: "ordered" }, { list: "bullet" }]);

      if (reference_formats.includes("align"))
        container.push([
          { align: "" },
          { align: "center" },
          { align: "right" },
          { align: "justify" },
        ]);

      if (reference_formats.includes("code-block"))
        container.push(["code-block"]);
      if (reference_formats.includes("table")) container.push(["table"]);

      // todo divider
      if (reference_formats.length > 0) container.push(["clean"]);

      let handlers = {
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
          new_line_height;
          // var range = this.quill.getSelection();
          // if (range) {
          //   this.quill.format(
          //     range.index,
          //     range.length,
          //     "line-height",
          //     +new_line_height,
          //     "user"
          //   );
          // }
        },
      };

      return {
        container,
        handlers,
      };
    },
    getEditorContent() {
      // console.log(`CollaborativeEditor • getEditorContent`);
      if (!this.editor.getText() || this.editor.getText() === "\n") return "";
      let html = this.editor.root.innerHTML;

      html = this.cleanEditorContent(html);

      return html;
    },
    cleanEditorContent(html) {
      // console.log(`CollaborativeEditor • cleanEditorContent`);

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
    },
    async enableEditor() {
      if (this.editor_is_enabled || !this.can_edit) return false;

      // min-height to prevents jumps
      const bloc_height = this.$el.offsetHeight;
      this.$el.style.setProperty("min-height", bloc_height + "px");

      // console.log(`CollaborativeEditor2 • enableEditor`);

      if (this.is_collaborative) await this.startCollaborative();

      this.editor.enable();

      this.editor.focus();

      // todo select latest used font as selected font
      // if (this.editor.getLength() <= 1) {
      //   const fontLastUsed = localStorage.getItem("fontLastUsed");
      //   this.editor.format("font", fontLastUsed);
      // }

      this.editor.setSelection(this.editor.getLength(), Quill.sources.SILENT);

      this.$emit(`contentIsEdited`, {
        $toolbar: this.toolbar_el,
        $tooltip: this.tooltip_el,
      });
      this.$el.style.removeProperty("min-height");
      this.editor_is_enabled = true;
    },
    async disableEditor() {
      if (!this.editor_is_enabled || this.is_disabling_editor) return false;

      // console.log(`CollaborativeEditor2 • disableEditor`);
      this.is_disabling_editor = true;

      this.editor.setSelection(null);
      this.editor.blur();
      this.updateSelectedLines();

      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }

      if (this.is_collaborative) this.endCollaborative();
      await this.saveText();

      // check if toolbar is away, get it back if it is
      this.getToolbarBack();
      this.$emit(`contentIsNotEdited`);

      this.$nextTick(() => {
        this.editor.disable();
        this.editor_is_enabled = false;
        this.is_disabling_editor = false;
      });
    },

    getToolbarBack() {
      if (
        !this.toolbar_el.parentElement.classList.contains(
          "_toolbarAndEditorContainer"
        )
      )
        this.$el
          .querySelector("._toolbarAndEditorContainer")
          .prepend(this.toolbar_el);
      if (
        !this.tooltip_el.parentElement.classList.contains(
          "_toolbarAndEditorContainer"
        )
      )
        this.$el
          .querySelector("._toolbarAndEditorContainer")
          .prepend(this.tooltip_el);
    },

    restoreVersion(content) {
      // it seems this allows for undo
      this.editor.root.innerHTML = content;

      // do not use, it doesnt respect \n
      // const value = content;
      // const delta = this.editor.clipboard.convert(value);
      // this.editor.setContents(delta, "user");

      this.show_archives = false;
    },

    editorClick($event) {
      // $event.preventDefault();
      if (
        $event.target.parentElement &&
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
      const new_content = this.getEditorContent();
      if (new_content === this.content) {
        return "content_not_changed";
      }

      if (!this.path) {
        this.$emit("save", new_content);
        return;
      }

      const new_meta = {
        [this.field_to_edit]: new_content,
      };

      try {
        this.is_loading_or_saving = true;
        await new Promise((r) => setTimeout(r, 300));
        await this.$api.updateMeta({
          path: this.path,
          new_meta,
        });
        this.is_loading_or_saving = false;
        this.show_saved_icon = true;
        await new Promise((r) => setTimeout(r, 300));
        this.show_saved_icon = false;
      } catch (err) {
        if (err.message === "content not changed") err;
        this.is_loading_or_saving = false;
      }
    },

    async startCollaborative() {
      return new Promise((resolve, reject) => {
        // const params = new URLSearchParams({
        //   folder_type: this.folder_type,
        //   folder_slug: this.folder_slug,
        //   meta_slug: this.meta_slug,
        // });

        // const path_to_meta = this.sharedb_id || this.path.replaceAll("/", "*");
        const path_to_meta = this.sharedb_id || encodeURIComponent(this.path);

        const requested_resource_url =
          (location.protocol === "https:" ? "wss" : "ws") +
          "://" +
          window.location.host +
          "/isSharedb" +
          `?path_to_meta=${path_to_meta}`;

        // console.log(
        //   `CollaborativeEditor / startCollaborative : will connect to ws server with ${requested_resource_url}`
        // );

        this.rtc.socket = new ReconnectingWebSocket(requested_resource_url);
        const connection = new ShareDB.Connection(this.rtc.socket);
        connection.on("state", (state) => {
          this.rtc.connection_state = state.toString();
        });

        // console.log(`CollaborativeEditor / connecting to doc ${path_to_meta}`);
        this.doc = connection.get("collaborative_texts", path_to_meta);

        this.doc.subscribe((err) => {
          if (err) console.error(`CollaborativeEditor / err ${err}`);
          // console.log(`CollaborativeEditor / doc subscribe`);

          if (this.doc.type) {
            // console.log(`CollaborativeEditor / doc already exists`);
            this.editor.setContents(this.doc.data, "init");
          } else {
            // console.log(`CollaborativeEditor / doc does not exists`);
            this.doc.create(this.editor.getContents(), "rich-text");
          }

          this.editor.history.clear();

          this.editor.on("text-change", this.submitOPAndSave);
          this.doc.on("op", (op, source) => {
            // console.log(`CollaborativeEditor / op applied`);
            this.text_deltas = this.doc.data;
            if (source === this.editor_id) return;
            // console.log(`CollaborativeEditor / outside op applied`);
            this.editor.updateContents(op);
          });

          this.collaborative_is_loaded = true;

          return resolve();
        });

        this.doc.on("error", (err) => {
          // err;
          // soucis : les situations ou le serveur a été fermé et en le rouvrant il ne possède plus d’instance du doc dans sharedb…
          console.error(`CollaborativeEditor / doc err ${err}`);
          this.$alertify.delay(4000).error(err);

          this.collaborative_is_loaded = true;

          return reject(err);
        });
      });
    },
    endCollaborative() {
      if (this.rtc.socket) this.rtc.socket.close();
      if (this.doc) {
        this.doc.unsubscribe();
        this.doc = null;
      }
      this.editor.off("text-change", this.submitOPAndSave);

      this.collaborative_is_loaded = false;
    },
    submitOPAndSave(delta, oldDelta, source) {
      // console.log(`CollaborativeEditor / submitOPAndSave w source ${source}`);
      if (source === "user") {
        this.doc.submitOp(delta, { source: this.editor_id });
        // console.log(
        //   `CollaborativeEditor / submitted op to server ${JSON.stringify(
        //     delta
        //   )}`
        // );
        this.updateTextMedia();
      }
    },

    updateTextMedia() {
      if (this.debounce_textUpdate) clearTimeout(this.debounce_textUpdate);
      this.debounce_textUpdate = setTimeout(async () => {
        // console.log(
        //   `CollaborativeEditor • updateTextMedia: saving new snapshot`
        // );
        await this.saveText();

        // const { font } = this.editor.getFormat();
        // localStorage.setItem("fontLastUsed", font);
      }, 5000);
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
      // console.log(`CollaborativeEditor • addMediaAtIndex ${index}`);
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
              // src: `./thumbs/${this.folder_type}/${this.folder_slug}/${thumb_path}`,
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
          .error(this.$t("media_type_not_handled"));
      }
    },

    onDragover($event) {
      if (!this.editor_is_enabled) return;
      // console.log(`CollaborativeEditor2 / onDragover`);
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
          // console.log(`CollaborativeEditor2 / dragleave`);
          _blot.domNode.classList.remove("is--dragover");
        });
      }
    },
    // onDragLeave($event) {},
    onDrop($event) {
      if (!this.editor_is_enabled) return;
      // console.log(`CollaborativeEditor2 / onDrop`);

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "move";

      this.removeDragoverFromBlots();

      if ($event.dataTransfer.getData("text/plain") === "media_in_quill") {
        // console.log(
        //   `CollaborativeEditor2 / onDrop : : drag and dropped a media from quill`
        // );

        let _blot = this.getBlockFromElement($event.target);
        const index = this.editor.getIndex(_blot);

        // find which blot was dragged (A)
        // find where it was dropped (B)
        // move delta from A to B

        // console.log(`_blot is currently at index ${index}`);
      } else if ($event.dataTransfer.getData("text/plain")) {
        // console.log(
        //   `CollaborativeEditor2 / onDrop : : dropped a media from the library`
        // );

        const media = JSON.parse($event.dataTransfer.getData("text/plain"));
        // console.log(media);

        if (media.media_filename) {
          // drop sur l’éditor et pas sur une ligne
          if ($event.target.classList.contains("ql-editor")) {
            // console.log(
            //   "dropped on editor and not on line, will insert at the end of doc"
            // );
            this.addMediaAtIndex(this.editor.getLength() - 1, media);
            return;
          }

          let _blot = this.getBlockFromElement($event.target);

          if (!_blot) {
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("failed_to_find_block_line"));
            return;
          }

          _blot =
            _blot.next !== null && _blot.next.domNode ? _blot.next : _blot;

          const index = this.editor.getIndex(_blot);
          this.addMediaAtIndex(index - 1, media);
        }
      } else {
        // console.log(
        //   `CollaborativeEditor2 / onDrop : missing meta for drop to occur`
        // );
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

  &:not(.is--editable) {
    border: none;
    ::v-deep .ql-toolbar {
      display: none;
    }
  }

  ::v-deep {
    .ql-container {
      font-size: inherit;
      font-family: inherit;
      font-weight: normal;
      background-color: transparent;
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
      counter-reset: listCounter;
      height: auto;
      overflow: visible;
      color: inherit;

      background-color: transparent;

      padding: 0px;
      padding-bottom: 0.4em;

      > * {
        padding: 0;
        margin: 0;
      }
      > img {
        max-width: 30ch;
      }

      blockquote {
        padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
        margin: calc(var(--spacing) * 1) 0;
        border: none;
        border-left: 2px solid var(--c-gris);
      }

      pre.ql-syntax {
        font-family: Fira Mono;
        padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
      }

      &[contenteditable="true"] {
        // padding: 2px;
        // padding-bottom: calc(var(--spacing) * 1);
      }

      > * {
        // counter-increment: listCounter;
        position: relative;
        // padding: 0;

        &::before {
          // content: counter(listCounter);
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
      .ql-editor {
        padding-bottom: 0;
        > * {
          cursor: inherit;
        }
      }
    }
  }
}
._collaborativeEditor:not(.is--editing_is_enabled) {
  ::v-deep {
    .ql-toolbar {
      padding: 0;
      margin: 0;
    }
    .ql-formats {
      display: none;
    }
  }
}

._floatingEditBtn {
  position: sticky;
  z-index: 101;
  top: calc(var(--spacing) / 4);
  height: 0;
  text-align: right;
  margin-right: calc(var(--spacing) / 4);

  > * {
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>
<style lang="scss">
.ql-toolbar.ql-toolbar {
  --toolbar-bg: var(--editor-bg);
  --editor-bg: #eee;
  --button-size: 32px;
  --border-size: 4px;
  --quill-buttons-size: 20px;
  --quill-options-size: 34px;

  ._collaborativeEditor.is--mobileView & {
    --button-size: 28px;
  }

  position: sticky;
  top: 0;
  z-index: 2;
  padding: calc(var(--spacing) / 4);
  margin-bottom: 0.3em;
  border-radius: 14px;
  // hides select, do not use
  // overflow: hidden;

  display: flex;
  flex-flow: row wrap;
  // gap: calc(var(--spacing) / 4);
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
    display: inherit;
    color: currentColor;
  }

  button,
  ._savingStatus,
  ._savedStatus,
  ._archivesBtn {
    min-width: var(--button-size);
    width: auto;
    height: var(--button-size);
    padding: 6px;
  }

  ._savingStatus,
  ._savedStatus,
  ._archivesBtn {
    min-width: 9.5rem;
  }
  ._savedStatus {
    background-color: var(--c-vert);
  }

  .ql-fill,
  .ql-stroke.ql-fill {
    fill: currentColor;
  }

  .ql-stroke {
    stroke: currentColor;
  }

  .ql-color-picker .ql-picker-options {
    // to prevent overflow issues with pagemenu overflow
    width: var(--quill-options-size);
  }

  .ql-picker {
    color: currentColor;

    &.ql-lineheight {
      width: 78px;
      .ql-picker-label,
      .ql-picker-item {
        &::before {
          content: "Normal (1.42)" !important;
        }
        &[data-value],
        &[data-value] {
          &::before {
            content: attr(data-value) !important;
          }
        }
      }
    }
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
    border: 2px solid var(--toolbar-bg);
    border-radius: 12px;
    background: #fff;

    button,
    > *:not(.ql-size):not(.ql-lineheight):not(.ql-header):not(.ql-font)
      .ql-picker-label {
      display: flex;
      align-items: center;
      justify-content: center;
      svg {
        width: var(--quill-buttons-size);
        height: var(--quill-buttons-size);
        flex: 0 0 auto;
      }
    }

    .ql-font {
      background: var(--editor-bg);
      background: transparent;
    }
    .ql-header {
      background: var(--editor-bg);
      background: transparent;
    }
    .ql-picker {
      height: var(--button-size);

      &.ql-size {
        width: 115px;
        .ql-picker-label,
        .ql-picker-item {
          &::before {
            content: "Par défaut" !important;
          }
          &[data-value],
          &[data-value] {
            &::before {
              content: attr(data-value) !important;
            }
          }
        }
      }
      &.ql-lineheight {
        width: 115px;
        .ql-picker-label,
        .ql-picker-item {
          &::before {
            content: "Normal (1.42)" !important;
          }
          &[data-value],
          &[data-value] {
            &::before {
              content: attr(data-value) !important;
            }
          }
        }
      }
    }
    .ql-picker-label {
      text-align: left;
      padding: 4px;
      // background: white;
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
}

.ql-tooltip.ql-tooltip {
  z-index: 10;
  line-height: 26px;
  margin-right: 8px;

  &[data-mode="link"]::before {
    content: "Lien :";
  }

  &.ql-hidden {
    display: none;
  }

  &.ql-editing {
    a.ql-action::after {
      border-right: 0px;
      content: "OK";
      padding-right: 0px;
    }
  }

  a.ql-action::after {
    border-right: 1px solid #ccc;
    content: "Modifier";
    margin-left: 16px;
    padding-right: 8px;
  }
}

._TEbtnContainer {
  // width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;

  > * {
    border: 2px solid var(--toolbar-bg);
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: center;

    ._editBtn {
      background-color: var(--c-bleuvert) !important;
      border-radius: 0 !important;
    }
  }

  // background-color: var(--editor-bg);
}
</style>
