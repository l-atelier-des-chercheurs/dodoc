<template>
  <div
    class="mediaTextContent quillWrapper" 
    autocorrect="off"
    autofocus="autofocus"
  >
    <!-- connection_state : {{ connection_state }}<br> -->
    <div ref="editor"
    />
  </div>
</template>
<script>
import { VueEditor } from 'vue2-editor';
import ReconnectingWebSocket from 'reconnectingwebsocket'
import ShareDB from 'sharedb/lib/client'
import Quill from 'quill'

ShareDB.types.register(require('rich-text').type);

export default {
  props: {
    value: {
      type: String,
      default: '…'
    },
    media: Object,
    slugFolderName: String
  },
  components: {
    VueEditor
  },
  data() {
    return {
      editor: null,
      editor_id: (Math.random().toString(36) + '00000000000000000').slice(2, 3 + 5),

      custom_toolbar: [
        [{ 'header': [false, 1, 2, 3, 4] }],
        // [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }, { 'header': 4 }],
        ['bold', 'italic', 'underline', 'link', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet'} ],
        ['clean']  
      ],

      socket: null,
      connection_state: undefined,
      requested_resource_url: undefined
    }
  },
  
  created() {
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      modules: {
        toolbar: this.custom_toolbar
      },
      theme: 'snow',
      formats: ['bold', 'underline', 'header', 'italic']
    });
    this.editor.root.innerHTML = this.value;

    this.$nextTick(() => {
      this.initWebsocketMode();
    });

  },
  beforeDestroy() {
    if(!!this.socket) {
      this.socket.close();
    }
  },
  watch: {
  },
  computed: {
  },
  methods: {
    initWebsocketMode() {
      const params = new URLSearchParams({
        'type': 'projects',
        'slugFolderName': this.slugFolderName,
        'metaFileName': this.media.metaFileName
      });

      const requested_querystring = '?' + params.toString();
      this.requested_resource_url = 
        (location.protocol === 'https:' ? 'wss' : 'ws')
        + '://'
        + window.location.host
        + '/sharedb'
        + requested_querystring
      ;

      console.log(`MOUNTED • CollaborativeEditor: will connect to ws server with ${this.requested_resource_url}`);

      this.socket = new ReconnectingWebSocket(this.requested_resource_url);
      const connection = new ShareDB.Connection(this.socket);
      connection.on('state', this.wsState);

      const doc = connection.get('textMedias', requested_querystring);

      doc.subscribe((err) => {
        if (err) {
          console.error(`ON • CollaborativeEditor: err ${err}`);
        }
        console.log(`ON • CollaborativeEditor: subscribe`);

        if (!doc.type) {
          console.log(`ON • CollaborativeEditor: no type found on doc, creating a new one with content ${JSON.stringify(this.editor.getContents())}`);
          doc.create(this.editor.getContents(), 'rich-text');
        } else {
          console.log(`ON • CollaborativeEditor: doc already exists and doc.data = ${JSON.stringify(doc.data, null, 4)}`);
          this.editor.setContents(doc.data);
          this.$emit('input', this.editor.getText() ? this.editor.root.innerHTML : '');
          // this.editor.setContents('plop');
        }


        this.editor.on('text-change', (delta, oldDelta, source) => {
          if (source == 'user') {
            console.log(`ON • CollaborativeEditor: text-change by user`);
            doc.submitOp(delta, { source: this.editor_id });
          } else {
            console.log(`ON • CollaborativeEditor: text-change by API`);
          }
          this.$emit('input', this.editor.getText() ? this.editor.root.innerHTML : '');
        });
        doc.on('op', (op, source) => {
          if (source === this.editor_id) return;
          console.log(`ON • CollaborativeEditor: operation applied to quill`);
          this.editor.updateContents(op);
        });
      });
    },
    wsState(state, reason) {
      console.log(`METHODS • CollaborativeEditor: wsState with state = ${state} and reason = ${reason}`);
      this.connection_state = state.toString();
      // 'connecting' 'connected' 'disconnected' 'closed' 'stopped'
    }
  }
}
</script>
<style>
</style>