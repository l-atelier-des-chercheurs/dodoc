<template>
  <div
    class="quillWrapper"
    autocorrect="off"
    autofocus="autofocus"
    :class="{ 'is--read_only': read_only }"
  >
    <!-- connection_state : {{ connection_state }}<br> -->
    <div ref="editor" class="mediaTextContent" />
  </div>
</template>
<script>
import ReconnectingWebSocket from "reconnectingwebsocket";
import ShareDB from "sharedb/lib/client";
import Quill from "quill";

ShareDB.types.register(require("rich-text").type);

// specify the fonts you would
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
        "font",
        "align",
        "code-block",
      ],
    });

    this.editor.root.innerHTML = this.value;

    if (this.read_only) this.editor.disable();

    this.$nextTick(() => {
      // this.initWebsocketMode();

      this.editor.on("text-change", (delta, oldDelta, source) => {
        if (this.read_only) return;

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
  watch: {
    read_only() {
      if (this.read_only) this.editor.disable();
      else this.editor.enable();
    },
  },
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
<style lang="scss"></style>
